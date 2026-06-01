import OpenAI from "openai";
import {
  OPENAI_CHAT_MODEL,
  OPENAI_MAX_TOKENS,
  DAILY_MESSAGE_LIMIT,
} from "@/lib/constants";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { isValidChatMessages } from "@/lib/validation/chat-messages";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementDailyUsage } from "@/lib/supabase/rate-limit";
import { logAuditEvent } from "@/lib/supabase/audit";
import { buildRagContext, retrieveRelevantChunks } from "@/lib/supabase/rag";

interface ChatRequestBody {
  messages: unknown;
  conversationId?: string;
}

/**
 * POST /api/chat — authenticated streaming chat with persistence, rate limits, RAG, and audit.
 */
export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server configuration error: missing API key." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body as ChatRequestBody;
  const messages = parsed.messages;
  let conversationId =
    typeof parsed.conversationId === "string" ? parsed.conversationId : null;

  if (!isValidChatMessages(messages)) {
    return Response.json(
      { error: "Expected a non-empty messages array." },
      { status: 400 },
    );
  }

  const rateLimit = await checkAndIncrementDailyUsage(supabase, user.id);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: `Daily message limit reached (${DAILY_MESSAGE_LIMIT}/day). Try again tomorrow.`,
      },
      { status: 429 },
    );
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return Response.json({ error: "No user message found." }, { status: 400 });
  }

  if (!conversationId) {
    const title = lastUserMessage.content.slice(0, 80) || "Nueva conversación";
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();

    if (convError || !newConv) {
      return Response.json(
        { error: "Failed to create conversation." },
        { status: 500 },
      );
    }
    conversationId = newConv.id;
  } else {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }
  }

  const { data: userMessageRow, error: userMsgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "user",
      content: lastUserMessage.content,
    })
    .select("id")
    .single();

  if (userMsgError || !userMessageRow) {
    return Response.json({ error: "Failed to save message." }, { status: 500 });
  }

  const { data: assistantMessageRow, error: assistantMsgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: "",
    })
    .select("id")
    .single();

  if (assistantMsgError || !assistantMessageRow) {
    return Response.json(
      { error: "Failed to create assistant message." },
      { status: 500 },
    );
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const openai = new OpenAI({ apiKey });

  let systemContent = SYSTEM_PROMPT;
  try {
    const chunks = await retrieveRelevantChunks(
      supabase,
      openai,
      lastUserMessage.content,
    );
    const ragContext = buildRagContext(chunks);
    if (ragContext) {
      systemContent = `${SYSTEM_PROMPT}\n\n${ragContext}`;
    }
  } catch {
    /* RAG is best-effort; continue without context */
  }

  try {
    const stream = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      max_tokens: OPENAI_MAX_TOKENS,
      stream: true,
      messages: [
        { role: "system", content: systemContent },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const encoder = new TextEncoder();
    let fullAssistantContent = "";
    let totalTokens: number | null = null;

    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "meta",
              conversationId,
              userMessageId: userMessageRow.id,
              assistantMessageId: assistantMessageRow.id,
            })}\n\n`,
          ),
        );

        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              fullAssistantContent += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
            if (chunk.usage?.total_tokens) {
              totalTokens = chunk.usage.total_tokens;
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          await supabase
            .from("messages")
            .update({
              content: fullAssistantContent || "—",
              tokens_used: totalTokens,
            })
            .eq("id", assistantMessageRow.id);

          await logAuditEvent(supabase, {
            userId: user.id,
            action: "chat.message_sent",
            metadata: {
              conversation_id: conversationId,
              model: OPENAI_CHAT_MODEL,
              tokens: totalTokens,
              user_message_id: userMessageRow.id,
              assistant_message_id: assistantMessageRow.id,
            },
            request,
          });
        } catch (streamError) {
          await supabase
            .from("messages")
            .update({
              content: fullAssistantContent || "Error during generation.",
            })
            .eq("id", assistantMessageRow.id);
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upstream request failed.";
    const status =
      message.includes("429") || message.toLowerCase().includes("rate")
        ? 429
        : 502;
    return Response.json(
      { error: "Unable to reach the language model. Please try again later." },
      { status },
    );
  }
}
