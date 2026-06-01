/** API route for chat completions (server-side OpenAI proxy). */
export const CHAT_API_PATH = "/api/chat" as const;

export {
  DAILY_MESSAGE_LIMIT,
  OPENAI_EMBEDDING_MODEL,
  CONVERSATIONS_API_PATH,
  FEEDBACK_API_PATH,
  ACCOUNT_API_PATH,
  PRIVACY_PATH,
  LEGAL_DOCUMENTS_BUCKET,
  RAG_CHUNK_SIZE,
  RAG_CHUNK_OVERLAP,
} from "@/lib/supabase/constants";

/** External portfolio URL for site footer. */
export const PORTFOLIO_URL =
  "https://sararellano.github.io/sararellano/" as const;

/** Default OpenAI model identifier (cost-efficient). */
export const OPENAI_CHAT_MODEL = "gpt-4o-mini" as const;

/** Maximum completion tokens per request (cost guardrail). */
export const OPENAI_MAX_TOKENS = 1000 as const;
