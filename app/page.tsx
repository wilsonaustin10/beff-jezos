'use client'

import { useChat } from 'ai/react'

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-[700px]">
          <h2 className="text-2xl font-semibold mb-4">Chat with Beff Jezos</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-500 mb-4">
                  Ask questions about Amazon's shareholder letters
                </p>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Try asking about:</p>
                  <ul className="list-none space-y-1">
                    <li>"What is Day 1 philosophy?"</li>
                    <li>"How does Amazon think about customer obsession?"</li>
                    <li>"What are two-pizza teams?"</li>
                    <li>"Explain high-velocity decision making"</li>
                  </ul>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-gray-100 mr-auto max-w-[80%]'
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'Beff'}
                </p>
                <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
                <p className="text-sm font-semibold mb-1">Beff</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about Day 1, customer obsession, long-term thinking..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}