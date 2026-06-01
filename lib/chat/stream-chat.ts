import { CHAT_API_PATH } from "@/lib/constants";
import { consumeSseStream } from "@/lib/chat/parse-sse";
import type { SseStreamMeta, StreamChatCallbacks } from "@/lib/chat/parse-sse";
import type { ApiChatMessage } from "@/lib/types";

/** Options for streaming a chat completion from the Next.js API route. */
export interface StreamChatOptions {
  conversationId: string | null;
  messages: ApiChatMessage[];
  signal?: AbortSignal;
  onToken: (text: string) => void;
  onMeta?: (meta: SseStreamMeta) => void;
}

interface ChatApiErrorBody {
  error?: string;
}

/**
 * POSTs to /api/chat and streams assistant tokens via SSE.
 */
export async function streamChatCompletion({
  conversationId,
  messages,
  signal,
  onToken,
  onMeta,
}: StreamChatOptions): Promise<void> {
  const response = await fetch(CHAT_API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, messages }),
    signal,
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const data = (await response.json()) as ChatApiErrorBody;
      if (data.error) {
        message = data.error;
      }
    } catch {
      /* non-JSON */
    }
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable.");
  }

  const callbacks: StreamChatCallbacks = {
    onToken,
    onMeta,
  };

  await consumeSseStream(reader, callbacks);
}
