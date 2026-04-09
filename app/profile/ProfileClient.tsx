'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { updateProfileAction } from '@/lib/auth-actions'
import { User } from 'lucide-react'

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

interface ProfileData {
  name: string; email: string; phone: string; dateOfBirth: string; placeOfBirth: string
}

export default function ProfileClient({ userId, initialData }: { userId: string; initialData: ProfileData }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined)

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Account
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            My Profile
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mystic-card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
              <User size={28} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
                {initialData.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{initialData.email}</p>
            </div>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="userId" value={userId} />

            {[
              { label: 'Full Name', name: 'name', type: 'text', defaultValue: initialData.name },
              { label: 'Phone Number', name: 'phone', type: 'tel', defaultValue: initialData.phone },
              { label: 'Place of Birth', name: 'placeOfBirth', type: 'text', defaultValue: initialData.placeOfBirth },
            ].map(({ label, name, type, defaultValue }) => (
              <div key={name}>
                <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>{label}</label>
                <input
                  type={type} name={name} defaultValue={defaultValue} required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
                {state?.errors?.[name] && (
                  <p className="text-xs mt-1" style={{ color: '#f87171' }}>{state.errors[name]![0]}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>Date of Birth</label>
              <input
                type="date" name="dateOfBirth" defaultValue={initialData.dateOfBirth} required
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
              />
            </div>

            {/* Read-only email */}
            <div>
              <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Email (cannot change)</label>
              <input type="email" value={initialData.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>

            {state?.message && (
              <p className="text-sm text-center" style={{ color: state.message.includes('success') ? '#4ade80' : '#f87171' }}>
                {state.message}
              </p>
            )}

            <button
              type="submit" disabled={pending}
              className="mt-2 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
            >
              {pending ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
