/** Roles allowed in the client-visible chat history (system is added server-side). */
export type ChatRole = "user" | "assistant";

/**
 * A single message in the UI transcript (includes client-generated or server id).
 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

/**
 * Payload sent to POST /api/chat — only user/assistant turns from the UI.
 */
export interface ApiChatMessage {
  role: ChatRole;
  content: string;
}

/** Request body for POST /api/chat. */
export interface ChatApiRequestBody {
  messages: ApiChatMessage[];
  conversationId?: string;
}

/** Summary of a conversation for the sidebar list. */
export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

/** Feedback rating for assistant messages. */
export type FeedbackRating = "helpful" | "not_helpful";

/** SSE meta event emitted at the start of a chat stream. */
export interface ChatStreamMeta {
  type: "meta";
  conversationId: string;
  userMessageId: string;
  assistantMessageId: string;
}
