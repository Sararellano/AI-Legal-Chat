import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { OPENAI_EMBEDDING_MODEL } from "@/lib/constants";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

export interface MatchedChunk {
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/**
 * Creates an embedding vector for the given text via OpenAI.
 */
export async function createEmbedding(
  openai: OpenAI,
  text: string,
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: text,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Empty embedding response.");
  }

  return embedding;
}

/**
 * Retrieves top matching document chunks for RAG context.
 */
export async function retrieveRelevantChunks(
  supabase: AppSupabase,
  openai: OpenAI,
  query: string,
  matchCount = 5,
): Promise<MatchedChunk[]> {
  const embedding = await createEmbedding(openai, query);
  const vectorString = `[${embedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: vectorString,
    match_count: matchCount,
    match_threshold: 0.5,
  });

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => ({
    content: row.content,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    similarity: row.similarity,
  }));
}

/**
 * Builds a RAG context block to prepend to the system prompt.
 */
export function buildRagContext(chunks: MatchedChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }

  const sections = chunks
    .map((chunk, index) => {
      const title =
        typeof chunk.metadata.title === "string"
          ? chunk.metadata.title
          : `Fragmento ${index + 1}`;
      return `### ${title}\n${chunk.content}`;
    })
    .join("\n\n");

  return `
CONTEXTO DOCUMENTAL (usa solo esta información para responder; si no basta, indícalo explícitamente):

${sections}
`.trim();
}
