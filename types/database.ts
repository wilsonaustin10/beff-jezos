export interface Document {
  id: number
  year: number
  title: string
  source_url: string | null
  content: string
  embedding: number[]
  created_at: string
}

export interface DocumentMatch extends Omit<Document, 'embedding'> {
  similarity: number
}