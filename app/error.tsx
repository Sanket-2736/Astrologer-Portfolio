'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          The cosmos encountered an unexpected disturbance. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
          >
            Try Again
          </button>
          <Link href="/" className="px-5 py-2 rounded-full text-sm font-medium"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
