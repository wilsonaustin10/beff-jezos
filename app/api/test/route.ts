import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth-check'

export async function GET(request: NextRequest) {
  // Check authentication
  const { user, error: authError } = await checkAuth(request)
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ 
    message: 'Test route works!',
    user: user.email 
  })
}

export async function POST(request: NextRequest) {
  // Check authentication
  const { user, error: authError } = await checkAuth(request)
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ 
    message: 'POST works!',
    user: user.email 
  })
}