'use client'

import { useActionState } from 'react'
import { adminLoginAction } from '@/lib/auth-actions'
import { Star } from 'lucide-react'

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '12px 16px',
  width: '100%',
  fontSize: '14px',
  outline: 'none',
}

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, undefined)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.3) 0%, var(--bg-primary) 70%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Star size={32} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} fill="currentColor" />
          <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
            Astrologer Portal
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Admin access only</p>
        </div>

        <div className="mystic-card p-8">
          <form action={action} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                Email
              </label>
              <input
                type="email" name="email" required placeholder="admin@email.com"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                Password
              </label>
              <input
                type="password" name="password" required placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
              />
            </div>

            {state?.message && (
              <p className="text-sm text-center" style={{ color: '#f87171' }}>{state.message}</p>
            )}

            <button
              type="submit" disabled={pending}
              className="mt-2 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
            >
              {pending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
