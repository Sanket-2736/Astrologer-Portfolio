'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, FileImage, Star } from 'lucide-react'
import type { SessionPayload } from '@/lib/session'

interface Stats { upcoming: number; past: number; kundalis: number }

const cards = (stats: Stats) => [
  { icon: Calendar, label: 'Upcoming Appointments', value: stats.upcoming, color: '#6366f1', href: '/book' },
  { icon: Clock, label: 'Past Sessions', value: stats.past, color: 'var(--gold)', href: '/dashboard/history' },
  { icon: FileImage, label: 'Kundali Charts', value: stats.kundalis, color: '#34d399', href: '/dashboard/kundali' },
]

export default function DashboardClient({ session, stats }: { session: SessionPayload; stats: Stats }) {
  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Welcome back
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            {session.name}
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {cards(stats).map(({ icon: Icon, label, value, color, href }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={href} className="mystic-card p-6 flex flex-col gap-3 block transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color }}>{value}</p>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mystic-card p-6"
        >
          <h2 className="text-base font-semibold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/book', label: '✦ Book Appointment' },
              { href: '/profile', label: '✦ Edit Profile' },
              { href: '/services', label: '✦ View Services' },
            ].map(({ href, label }) => (
              <Link
                key={href} href={href}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Astrology tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 mystic-card p-6 flex gap-4 items-start"
        >
          <Star size={20} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} fill="currentColor" />
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
              Daily Cosmic Insight
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              The stars align in your favour today. Mercury&apos;s direct motion brings clarity to communications
              and decisions. An auspicious time for new beginnings.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
