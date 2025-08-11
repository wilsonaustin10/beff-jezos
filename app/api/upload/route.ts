import { NextRequest, NextResponse } from 'next/server'
import { processDocument } from '@/lib/document-processor'
import { checkAuth } from '@/lib/auth-check'

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Dynamic import to avoid build-time issues
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  
  // Disable worker to avoid issues in Next.js
  ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = false
  
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }
  
  return fullText
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await checkAuth(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const year = parseInt(formData.get('year') as string)
    const title = formData.get('title') as string
    const sourceUrl = formData.get('sourceUrl') as string || ''
    
    if (!file || !year || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const bytes = await file.arrayBuffer()
    
    let text: string
    
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(bytes)
    } else {
      text = new TextDecoder().decode(bytes)
    }
    
    await processDocument(text, year, title, sourceUrl)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}