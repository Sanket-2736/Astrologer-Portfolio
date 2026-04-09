'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/lib/auth-actions'
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

function Field({
  label, name, type = 'text', placeholder, error,
}: {
  label: string; name: string; type?: string; placeholder?: string; error?: string[]
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
        {label}
      </label>
      <input
        type={type} name={name} required placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{error[0]}</p>}
    </div>
  )
}

export default function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.3) 0%, var(--bg-primary) 70%)' }}
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Star size={32} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} fill="currentColor" />
          <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
            Create Your Account
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Begin your cosmic journey</p>
        </div>

        <div className="mystic-card p-8">
          <form action={action} className="flex flex-col gap-4">
            <Field label="Full Name" name="name" placeholder="Your full name" error={state?.errors?.name} />
            <Field label="Email" name="email" type="email" placeholder="your@email.com" error={state?.errors?.email} />
            <Field label="Password" name="password" type="password" placeholder="Min. 8 characters" error={state?.errors?.password} />
            <Field label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" error={state?.errors?.phone} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                  Date of Birth
                </label>
                <input
                  type="date" name="dateOfBirth" required
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
                {state?.errors?.dateOfBirth && (
                  <p className="text-xs mt-1" style={{ color: '#f87171' }}>{state.errors.dateOfBirth[0]}</p>
                )}
              </div>
              <Field label="Place of Birth" name="placeOfBirth" placeholder="City, Country" error={state?.errors?.placeOfBirth} />
            </div>

            {state?.message && (
              <p className="text-sm text-center" style={{ color: '#f87171' }}>{state.message}</p>
            )}

            <button
              type="submit" disabled={pending}
              className="mt-2 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
            >
              {pending ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--gold-light)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
