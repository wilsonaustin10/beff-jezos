import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { UserNav } from '@/components/user-nav'
import { NavLinks } from '@/components/nav-links'
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
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">Beff Jezos</h1>
                  <UserNav />
                </div>
                <NavLinks />
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