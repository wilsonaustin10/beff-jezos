'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()
  
  return (
    <nav className="flex space-x-4">
      <Link
        href="/"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          pathname === '/' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Chat
      </Link>
      <Link
        href="/upload"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          pathname === '/upload' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Upload
      </Link>
    </nav>
  )
}