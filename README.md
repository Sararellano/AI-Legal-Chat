# Spanish Labor Law Assistant (España)

Informational chat about **Spanish labor law** (employment contracts and dismissals) with **streaming** OpenAI responses, **Supabase** persistence, auth, rate limits, RAG, and GDPR tooling. Built with Next.js App Router, TypeScript (strict), Tailwind CSS, and shadcn/ui primitives.

> **Disclaimer:** Content is for orientation only and is not legal advice.

## Stack

- Next.js 16 (App Router) — SSR-ready, Vercel-compatible
- React 19 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (`Button`, `Textarea`)
- OpenAI API (`gpt-4o-mini` chat + `text-embedding-3-small` embeddings)
- Supabase (Auth, PostgreSQL, Storage, pgvector)
- Jest + React Testing Library (≥80% coverage on tested modules)

## Project structure

```
app/              # Routes, API, global styles
components/       # UI (see components/README.md)
hooks/            # useChat (see hooks/README.md)
lib/              # Utils, SSE, Supabase, validation
supabase/         # SQL migrations
__tests__/        # Unit and snapshot tests
```

## Requirements

- **Node.js 20.9+** (recommended: **22** via [nvm](https://github.com/nvm-sh/nvm))
- **npm 10+** (recommended: latest — `npm install -g npm@latest`)
- OpenAI account with an API key
- Supabase project (Free tier works for development)

Pinned: `packageManager` **npm@11.16.0**. Next.js 16 does **not** run on Node 12.

## Supabase setup (manual, in browser)

1. Create an account at [supabase.com](https://supabase.com).
2. **New project** → choose an **EU region** (e.g. Frankfurt) if your users are in Spain.
3. Copy credentials from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)
4. **Database → Extensions** → enable **`vector`** (required for RAG / Phase 3).
5. **SQL Editor** → paste and run [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
6. **Authentication → Providers** → enable **Email** (password and/or magic link).
7. **Storage → New bucket** → name `legal-documents`, set **Private**.
8. Duplicate all env vars in **Vercel → Environment Variables** when deploying.

### PDF ingestion (RAG)

Upload curated PDFs via the admin endpoint:

```bash
curl -X POST http://localhost:3000/api/ingest-pdf \
  -H "x-admin-secret: YOUR_INGEST_ADMIN_SECRET" \
  -F "file=@document.pdf" \
  -F "title=ET Resumen"
```

Requires `INGEST_ADMIN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`. Scanned PDFs without OCR are not supported.

## Local development

```bash
nvm use
npm install
cp .env.example .env.local
# Edit .env.local with OPENAI_API_KEY and Supabase vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (ingest, account deletion) |
| `INGEST_ADMIN_SECRET` | For RAG ingest | Header secret for `/api/ingest-pdf` |
| `AUDIT_IP_SALT` | Optional | Salt for hashing IPs in audit logs |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install Node 22 (nvm), latest npm, deps, then dev |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Tests with coverage thresholds |

## Features by phase

| Phase | Feature |
|-------|---------|
| 1 | Auth, conversation history, daily rate limit (30 msg/day), audit events |
| 2 | Thumbs up/down feedback on assistant messages |
| 3 | PDF ingest + pgvector RAG in chat responses |
| 4 | Account deletion (`DELETE /api/account`), privacy policy, retention docs |

## Data retention & GDPR

- Messages, conversations, usage counters, audit events, and feedback are stored in Supabase while the account exists.
- Users can delete all data via **Eliminar mi cuenta y datos** in the footer (`DELETE /api/account`).
- Audit logs store a **hashed IP** (not plain IP) when `AUDIT_IP_SALT` is set.
- On Supabase Free tier, schedule periodic manual cleanup of old data (no pg_cron). See [`app/privacy/page.tsx`](app/privacy/page.tsx).
- This is minimal technical implementation — not legal GDPR advice.

## Deploy on Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. If using the `portfolio` monorepo, set **Root directory** to `ai-legal-chat`.
3. Add all environment variables from `.env.example`.
4. Deploy.

## Change model or token limit

Edit `OPENAI_CHAT_MODEL` and `OPENAI_MAX_TOKENS` in [`lib/constants.ts`](lib/constants.ts).

## Documentation languages

- English: this file
- Chinese: [README.zh-CN.md](README.zh-CN.md)

## Author

Built by [Sararellano](https://sararellano.github.io/sararellano/).
