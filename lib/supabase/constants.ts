/** Maximum user messages per calendar day (demo guardrail). */
export const DAILY_MESSAGE_LIMIT = 30 as const;

/** OpenAI embedding model for RAG (1536 dimensions). */
export const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small" as const;

/** Chunk size for PDF text splitting (characters). */
export const RAG_CHUNK_SIZE = 800 as const;

/** Overlap between consecutive chunks (characters). */
export const RAG_CHUNK_OVERLAP = 100 as const;

/** Supabase Storage bucket for legal PDFs. */
export const LEGAL_DOCUMENTS_BUCKET = "legal-documents" as const;

/** API route for conversations CRUD. */
export const CONVERSATIONS_API_PATH = "/api/conversations" as const;

/** API route for message feedback. */
export const FEEDBACK_API_PATH = "/api/feedback" as const;

/** API route for account deletion. */
export const ACCOUNT_API_PATH = "/api/account" as const;

/** Privacy policy page path. */
export const PRIVACY_PATH = "/privacy" as const;
