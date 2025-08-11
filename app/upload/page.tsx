'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setUploadStatus('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        setUploadStatus('Document uploaded successfully!')
        e.currentTarget.reset()
      } else {
        const error = await response.text()
        setUploadStatus(`Failed to upload document: ${error}`)
      }
    } catch (error) {
      setUploadStatus('Error uploading document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upload Document</h1>
          <p className="text-gray-600 mb-8">
            Upload Amazon shareholder letters to expand the knowledge base
          </p>

          <form onSubmit={handleFileUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File
              </label>
              <input
                type="file"
                name="file"
                accept=".pdf,.txt"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Accepts PDF or TXT files
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                min="1997"
                max="2024"
                required
                placeholder="e.g., 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Year of the shareholder letter
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g., 2020 Letter to Shareholders"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source URL (optional)
              </label>
              <input
                type="url"
                name="sourceUrl"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Original document URL for reference
              </p>
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            
            {uploadStatus && (
              <div className={`p-4 rounded-md ${uploadStatus.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {uploadStatus}
              </div>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Where to find shareholder letters</h2>
            <p className="text-gray-600 mb-3">
              You can download Amazon's shareholder letters from:
            </p>
            <a 
              href="https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Amazon Investor Relations →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}