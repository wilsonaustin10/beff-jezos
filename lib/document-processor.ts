import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { openai } from './openai'
import { supabase } from './supabase'

export interface ProcessedDocument {
  year: number
  title: string
  sourceUrl: string
  chunks: string[]
}

export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  })
  
  const chunks = await splitter.splitText(text)
  return chunks
}

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  
  return response.data[0].embedding
}

export async function storeDocument(
  year: number,
  title: string,
  sourceUrl: string,
  content: string,
  embedding: number[]
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .insert({
      year,
      title,
      source_url: sourceUrl,
      content,
      embedding,
    })
  
  if (error) {
    throw new Error(`Failed to store document: ${error.message}`)
  }
}

export async function processDocument(
  text: string,
  year: number,
  title: string,
  sourceUrl: string
): Promise<void> {
  const chunks = await chunkText(text)
  
  for (const chunk of chunks) {
    const embedding = await embedText(chunk)
    await storeDocument(year, title, sourceUrl, chunk, embedding)
  }
}