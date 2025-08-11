import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { UserNav } from '@/components/user-nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beff Jezos - Chat with Shareholder Letters',
  description: 'Chat with Jeff Bezos shareholder letters using RAG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b bg-white">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Beff Jezos</h1>
                <UserNav />
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}