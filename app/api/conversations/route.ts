import { createClient } from "@/lib/supabase/server";
import type { ConversationRow, MessageRow } from "@/lib/supabase/database.types";

export interface ConversationWithMessages extends ConversationRow {
  messages: MessageRow[];
}

/**
 * GET /api/conversations — list user conversations or fetch one with messages.
 * Query: ?id=<uuid> for a single conversation with message history.
 */
export async function GET(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("id");

  if (conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (convError || !conversation) {
      return Response.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) {
      return Response.json({ error: "Failed to load messages." }, { status: 500 });
    }

    const result: ConversationWithMessages = {
      ...conversation,
      messages: messages ?? [],
    };

    return Response.json(result);
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: "Failed to load conversations." },
      { status: 500 },
    );
  }

  return Response.json({ conversations: conversations ?? [] });
}

/**
 * POST /api/conversations — create a new conversation thread.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let title = "Nueva conversación";
  try {
    const body = (await request.json()) as { title?: string };
    if (body.title?.trim()) {
      title = body.title.trim().slice(0, 120);
    }
  } catch {
    /* empty body is fine */
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error || !conversation) {
    return Response.json(
      { error: "Failed to create conversation." },
      { status: 500 },
    );
  }

  return Response.json({ conversation }, { status: 201 });
}
