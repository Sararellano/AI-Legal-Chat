import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LEGAL_DOCUMENTS_BUCKET,
  RAG_CHUNK_OVERLAP,
  RAG_CHUNK_SIZE,
} from "@/lib/supabase/constants";
import { createEmbedding } from "@/lib/supabase/rag";
import { OPENAI_EMBEDDING_MODEL } from "@/lib/constants";

/**
 * Splits text into overlapping chunks for embedding.
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + RAG_CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end >= text.length) {
      break;
    }
    start = end - RAG_CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * POST /api/ingest-pdf — admin-only PDF ingestion pipeline.
 * Header: x-admin-secret must match INGEST_ADMIN_SECRET.
 * Body: multipart/form-data with `file` (PDF) and optional `title`.
 */
export const runtime = "nodejs";
export async function POST(request: Request): Promise<Response> {
  const adminSecret = process.env.INGEST_ADMIN_SECRET;
  const providedSecret = request.headers.get("x-admin-secret");

  if (!adminSecret || providedSecret !== adminSecret) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server configuration error: missing API key." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const titleField = formData.get("title");

  if (!(file instanceof File)) {
    return Response.json({ error: "PDF file is required." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  const title =
    typeof titleField === "string" && titleField.trim()
      ? titleField.trim().slice(0, 200)
      : file.name.replace(/\.pdf$/i, "");

  const buffer = Buffer.from(await file.arrayBuffer());

  let pdfText: string;
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    pdfText = parsed.text?.trim() ?? "";
  } catch {
    return Response.json({ error: "Failed to parse PDF." }, { status: 422 });
  }

  if (!pdfText) {
    return Response.json(
      { error: "No extractable text in PDF (scanned images need OCR)." },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const storagePath = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await admin.storage
    .from(LEGAL_DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return Response.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: document, error: docError } = await admin
    .from("documents")
    .insert({ title, storage_path: storagePath })
    .select()
    .single();

  if (docError || !document) {
    return Response.json({ error: "Failed to save document record." }, { status: 500 });
  }

  const chunks = chunkText(pdfText);
  const openai = new OpenAI({ apiKey });

  let insertedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i];
    const embedding = await createEmbedding(openai, content);
    const vectorString = `[${embedding.join(",")}]`;

    const { error: chunkError } = await admin.from("document_chunks").insert({
      document_id: document.id,
      content,
      embedding: vectorString,
      metadata: {
        title,
        chunk_index: i,
        total_chunks: chunks.length,
        model: OPENAI_EMBEDDING_MODEL,
      },
    });

    if (!chunkError) {
      insertedCount++;
    }
  }

  return Response.json({
    documentId: document.id,
    title,
    storagePath,
    chunksInserted: insertedCount,
    totalChunks: chunks.length,
  });
}
