'use client'

import { useAuth } from './auth-provider'

export function UserNav() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  )
}