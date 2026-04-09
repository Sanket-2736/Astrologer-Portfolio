import Link from 'next/link'
import { Star } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center max-w-md">
        <Star size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
        <h1 className="text-6xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>404</h1>
        <p className="text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
          Page Not Found
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          The cosmic path you seek does not exist. Let the stars guide you home.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
