-- Enable pgvector extension
create extension if not exists vector;

-- Documents table (1536 dims matches text-embedding-3-small)
create table if not exists documents (
  id bigserial primary key,
  year int,
  title text,
  source_url text,
  content text not null,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at timestamp with time zone default now()
);

-- Simple cosine-similarity matcher
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 6,
  min_similarity float default 0.75
) returns table (
  id bigint,
  year int,
  title text,
  source_url text,
  content text,
  similarity float
) language sql stable as $$
  select
    d.id, 
    d.year, 
    d.title, 
    d.source_url, 
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where 1 - (d.embedding <=> query_embedding) >= min_similarity
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- Index for scale (IVFFlat for cosine similarity)
create index if not exists documents_embedding_cos_idx
  on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);