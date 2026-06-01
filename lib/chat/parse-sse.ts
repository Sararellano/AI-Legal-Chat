/** Parsed SSE payload containing streamed assistant text. */
export interface SseTextChunk {
  text: string;
}

/** Metadata from /api/chat stream. */
export interface SseStreamMeta {
  type?: string;
  done?: boolean;
  text?: string;
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
}

export type SseParseResult = SseTextChunk | "done" | SseStreamMeta | null;

export interface StreamChatCallbacks {
  onToken: (text: string) => void;
  onMeta?: (meta: SseStreamMeta) => void;
}

/**
 * Parses one Server-Sent Events line from the chat API.
 */
export function parseSseLine(line: string): SseParseResult {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) {
    return null;
  }

  const payload = trimmed.slice(6);
  if (payload === "[DONE]") {
    return "done";
  }

  try {
    const parsed = JSON.parse(payload) as SseStreamMeta;
    if (parsed.type === "meta") {
      return parsed;
    }
    if (parsed.done) {
      return parsed;
    }
    if (typeof parsed.text === "string" && parsed.text.length > 0) {
      return { text: parsed.text };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Consumes an SSE byte stream and invokes callbacks per chunk.
 */
export async function consumeSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks: StreamChatCallbacks | ((text: string) => void),
): Promise<void> {
  const onToken =
    typeof callbacks === "function" ? callbacks : callbacks.onToken;
  const onMeta =
    typeof callbacks === "function" ? undefined : callbacks.onMeta;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const result = parseSseLine(line);
      if (result === "done") {
        return;
      }
      if (result !== null && "text" in result && result.text) {
        onToken(result.text);
      } else if (result !== null && typeof result === "object") {
        onMeta?.(result);
      }
    }
  }
}
