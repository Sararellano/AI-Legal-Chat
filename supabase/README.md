# Supabase setup

## 1. Create project

1. [supabase.com](https://supabase.com) → New project (EU region recommended).
2. Copy URL and keys into `.env.local` (see `.env.example`).

## 2. Run migration

Open **SQL Editor** and run [`migrations/001_initial.sql`](migrations/001_initial.sql).

Enable extension **vector** under Database → Extensions if the script warns.

## 3. Auth

In **Authentication → Providers**, enable **Email** (password sign-in).

Optional: disable email confirmation for local dev.

## 4. Storage (RAG PDFs)

Create bucket `legal-documents` (private).

Upload PDFs via:

```bash
curl -X POST http://localhost:3000/api/ingest-pdf \
  -H "x-admin-secret: YOUR_INGEST_ADMIN_SECRET" \
  -F "file=@document.pdf" \
  -F "title=Estatuto resumen"
```

## 5. Vercel

Add the same environment variables in Project Settings.

## Free tier limits

See [supabase.com/pricing](https://supabase.com/pricing) (500 MB DB, 1 GB storage, etc.).
