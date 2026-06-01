# Hooks

## `useChat`

Custom hook that owns chat state and OpenAI streaming:

- Message list and composer input
- `sendMessage` / `stopStreaming` with `AbortController`
- Delegates HTTP + SSE parsing to `lib/chat/stream-chat.ts`

Used exclusively by `ChatShell`.
