# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js RAG (Retrieval-Augmented Generation) chatbot that emulates Jeff Bezos's communication style using his shareholder letters. The system uses Supabase for vector storage with pgvector, OpenAI for embeddings and chat completions, and implements semantic search for contextual responses.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Core Components

1. **Vector Database**: Supabase with pgvector extension for storing document embeddings (1536 dimensions for OpenAI text-embedding-3-small)

2. **API Routes**:
   - `/api/chat` - Handles chat requests with RAG pipeline: embeds query → similarity search → context retrieval → GPT-4 response
   - `/api/upload` - Processes PDF/TXT documents: extracts text → chunks (1000 tokens, 100 overlap) → generates embeddings → stores in Supabase
   - `/api/test` - Testing endpoint

3. **Document Processing Pipeline**:
   - Text extraction from PDFs using pdfjs-dist
   - Chunking with RecursiveCharacterTextSplitter (Langchain)
   - Embedding generation via OpenAI text-embedding-3-small
   - Storage with cosine similarity indexing (IVFFlat)

4. **Chat Flow**:
   - User message → Embed query → Find top 6 similar chunks (cosine similarity ≥ 0.75)
   - Build context from retrieved documents → GPT-4 with system prompt
   - Stream response back to UI using AI SDK

## Key Files

- `app/api/chat/route.ts` - Main chat endpoint with Beff Jezos system prompt
- `app/api/upload/route.ts` - Document upload and PDF processing
- `lib/document-processor.ts` - Core text chunking and embedding logic
- `lib/supabase.ts` - Supabase client configuration
- `lib/openai.ts` - OpenAI client setup
- `supabase/migrations/001_create_documents_table.sql` - Database schema with pgvector

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
OPENAI_API_KEY
```

## Database Schema

The `documents` table stores:
- `year` (int) - Year of the shareholder letter
- `title` (text) - Document title
- `source_url` (text) - Original source URL
- `content` (text) - Chunk content
- `embedding` (vector(1536)) - OpenAI embeddings
- `created_at` (timestamp) - Creation timestamp

The `match_documents` function performs cosine similarity search with configurable match count and minimum similarity threshold.

## Python Scripts

Located in `/scripts/` for bulk document import:
- `import_letters.py` - Import shareholder letters
- `simple_import.py` - Basic document import
- `import_from_files.py` - Batch file import

## Testing

Run the test endpoint at `/api/test` to verify API functionality.

## TypeScript Configuration

- Strict mode enabled
- Path alias `@/*` maps to project root
- Next.js plugin configured