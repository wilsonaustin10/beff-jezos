# Beff Jezos - RAG Chat with Amazon Shareholder Letters

A Next.js application that implements RAG (Retrieval-Augmented Generation) to chat with Jeff Bezos' shareholder letters in his distinctive style.

## Architecture

- **Frontend**: Next.js App Router with streaming chat UI
- **Vector DB**: Supabase with pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-4 for chat completions
- **Document Processing**: PDF/TXT upload with automatic chunking

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and add your keys:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`

### 3. Setup Supabase Database

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_create_documents_table.sql`
3. This will:
   - Enable pgvector extension
   - Create documents table with vector embeddings
   - Create similarity search function
   - Add IVFFlat index for performance

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Upload Documents

1. Download shareholder letters from [Amazon's investor relations site](https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx)
2. Upload via the web interface:
   - Select PDF or TXT file
   - Enter year (e.g., 2020)
   - Enter title (e.g., "2020 Letter to Shareholders")
   - Optional: Add source URL

### Chat

Ask questions about:
- Day 1 philosophy
- Customer obsession
- Long-term thinking
- Two-pizza teams
- High-velocity decision making
- And more...

The bot will respond in Bezos's style, citing specific years and excerpts from the letters.

## API Endpoints

### POST /api/upload
- Accepts PDF/TXT files
- Chunks text (~1000 tokens with 100 token overlap)
- Generates embeddings via OpenAI
- Stores in Supabase with pgvector

### POST /api/chat
- Embeds user query
- Performs similarity search (cosine distance)
- Retrieves top 6 most relevant chunks
- Generates response with GPT-4
- Streams response back to UI

## Key Features

- **Streaming responses**: Real-time token streaming for better UX
- **Semantic search**: pgvector for efficient similarity matching
- **Style emulation**: Captures Bezos's writing style and principles
- **Citation**: Always references specific years and excerpts
- **Scalable**: IVFFlat indexing for production scale

## Production Considerations

1. **Rate limiting**: Add API rate limits for upload/chat endpoints
2. **Authentication**: Implement user auth with Supabase Auth
3. **Monitoring**: Add error tracking and analytics
4. **Caching**: Consider caching embeddings for common queries
5. **Index tuning**: Adjust IVFFlat lists parameter based on dataset size