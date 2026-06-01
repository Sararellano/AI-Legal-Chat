-- ai-legal-chat initial schema (Phases 1–3)
-- Run in Supabase SQL Editor or via Supabase CLI after creating your project.

-- ---------------------------------------------------------------------------
-- Extensions (enable vector in Dashboard → Database → Extensions if this fails)
-- ---------------------------------------------------------------------------
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- Phase 1: Core tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Nueva conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tokens_used integer,
  created_at timestamptz not null default now()
);

create table public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default (current_date),
  message_count integer not null default 0,
  primary key (user_id, date)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index idx_conversations_user_id on public.conversations (user_id);
create index idx_conversations_updated_at on public.conversations (updated_at desc);
create index idx_messages_conversation_id on public.messages (conversation_id);
create index idx_messages_created_at on public.messages (created_at);
create index idx_audit_events_user_id on public.audit_events (user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Phase 2: Feedback
-- ---------------------------------------------------------------------------

create table public.message_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating text not null check (rating in ('helpful', 'not_helpful')),
  comment text,
  created_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create index idx_message_feedback_message_id on public.message_feedback (message_id);

-- ---------------------------------------------------------------------------
-- Phase 3: RAG documents & chunks
-- ---------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_document_chunks_document_id on public.document_chunks (document_id);
create index idx_document_chunks_embedding on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Similarity search RPC (cosine distance)
create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.embedding is not null
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.usage_daily enable row level security;
alter table public.audit_events enable row level security;
alter table public.message_feedback enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- messages (via conversation ownership)
create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- usage_daily
create policy "Users can view own usage"
  on public.usage_daily for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.usage_daily for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.usage_daily for update
  using (auth.uid() = user_id);

-- audit_events (insert + select own)
create policy "Users can view own audit events"
  on public.audit_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own audit events"
  on public.audit_events for insert
  with check (auth.uid() = user_id);

-- message_feedback
create policy "Users can view own feedback"
  on public.message_feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert feedback on own messages"
  on public.message_feedback for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id and c.user_id = auth.uid()
    )
  );

create policy "Users can update own feedback"
  on public.message_feedback for update
  using (auth.uid() = user_id);

-- documents & chunks: read-only for authenticated users (ingest uses service role)
create policy "Authenticated users can read documents"
  on public.documents for select
  to authenticated
  using (true);

create policy "Authenticated users can read document chunks"
  on public.document_chunks for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Phase 3: Storage bucket (legal-documents, private)
-- Create bucket in Dashboard → Storage → New bucket: "legal-documents" (private)
-- Or run (requires service role / dashboard):
-- insert into storage.buckets (id, name, public) values ('legal-documents', 'legal-documents', false);
-- ---------------------------------------------------------------------------

-- Storage policies: only service role uploads; authenticated users cannot read raw PDFs
-- (RAG uses DB chunks, not direct Storage access from clients)
