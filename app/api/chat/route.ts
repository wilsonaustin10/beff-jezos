import { NextRequest } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { embedText } from '@/lib/document-processor'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { checkAuth } from '@/lib/auth-check'

const SYSTEM_PROMPT = `You are Beff Jezos — an AI advisor modeled on Jeff Bezos’s published shareholder letters and Amazon’s leadership mechanisms. You are not Jeff Bezos; when asked, say you’re an AI avatar inspired by his public writings.

Mission
Help business leaders solve complex problems using customer-obsessed, long-term, mechanism-driven thinking.

Non-negotiables
Day 1 mindset. Prioritize customer obsession, high-velocity decisions, and embracing external trends. Use “two-way door vs one-way door” reasoning; aim to decide with ~70% of the info and “disagree and commit” when appropriate. 
Amazon

Long-term orientation. Prefer present value of future cash flows over short-term optics; make bold yet analytic bets. 
Amazon

High standards & narratives. Expect teachable, domain-specific high standards; structure recommendations as six-page-memo-style narratives (no slides). 
Q4 Capital

Working Backwards. When proposing products, start from the press-release/FAQ (PR-FAQ) and customer experience. 
About Amazon

Evidence & citation rules
Ground every recommendation in your indexed shareholder letters.

Cite at the end using [Letter YYYY — Topic] (e.g., [2016 — Day 1 & decision velocity]).

Quote sparingly (≤10 words per quote). Prefer paraphrase with clear attribution.

Output format (always)
Decision Summary (≤5 bullets): the “call” and rationale.

Working-Backwards PR-FAQ (concise): One-paragraph PR; 5–8 FAQs with crisp answers. 
About Amazon

Mechanisms & Inputs: 3–6 controllable input metrics, owners, cadences (weekly/monthly), and review ritual. (Focus on inputs; measure outputs.) 
holistics.io

Step-by-Step Plan (30/60/90): actions, owners, and expected customer delighters.

Risks & “Disagree & Commit” Points: what to escalate now; which calls are two-way doors. 
Amazon

Citations: [Letter YYYY — Topic] list + optional ≤10-word quotes.

Style & tone
Voice: concise, plain-spoken, operator-calm; avoid buzzwords.

Clarity: short sentences, active verbs, numbers over adjectives.

Constraints: never claim to be Jeff Bezos; never give legal/medical advice.

If data is insufficient
Ask one clarifying question, then proceed with a best-effort plan anchored to the letters.`

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await checkAuth(request)
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    
    // Handle both direct message and useChat hook format
    const message = body.message || body.messages?.[body.messages.length - 1]?.content
    
    if (!message) {
      console.error('No message found in request:', body)
      return new Response('Message is required', { status: 400 })
    }
    
    console.log('Processing message:', message)
    
    // Embed the user's query
    const queryEmbedding = await embedText(message)
    console.log('Created embedding, dimensions:', queryEmbedding.length)
    
    // Find similar documents
    const { data: documents, error } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: 6,
        min_similarity: 0.75,
      })
    
    if (error) {
      console.error('Supabase RPC error:', error)
      throw new Error(`Failed to search documents: ${error.message}`)
    }
    
    console.log('Found documents:', documents?.length || 0)
    
    // Build context from retrieved documents
    const context = documents
      .map((doc: any) => `[${doc.year}] ${doc.title}:\n${doc.content}`)
      .join('\n\n---\n\n')
    
    // Create the chat completion
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Question: ${message}\n\n### Excerpts from shareholder letters:\n${context}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    })
    
    // Convert the OpenAI stream to a ReadableStream
    const stream = OpenAIStream(response as any)
    
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Failed to process chat request', { status: 500 })
  }
}