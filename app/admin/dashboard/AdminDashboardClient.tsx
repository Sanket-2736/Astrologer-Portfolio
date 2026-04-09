'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CalendarDays, Users, IndianRupee, Star } from 'lucide-react'
import { logoutAction } from '@/lib/auth-actions'

interface Stats { todayBookings: number; totalClients: number; totalRevenue: number }

export default function AdminDashboardClient({ stats }: { stats: Stats }) {
  const statCards = [
    { icon: CalendarDays, value: stats.todayBookings, label: "Today's Bookings", color: '#6366f1' },
    { icon: Users, value: stats.totalClients, label: 'Total Clients', color: 'var(--gold)' },
    { icon: IndianRupee, value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, label: 'Total Revenue', color: '#34d399' },
  ]

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
              Admin Panel
            </p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
              Astrologer Dashboard
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}
            >
              Logout
            </button>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {statCards.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="mystic-card p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color }}>{value}</p>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </motion.div>
          ))}
        </div>

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
              { href: '/admin/bookings', label: '✦ View Appointments' },
              { href: '/admin/clients', label: '✦ Manage Clients' },
              { href: '/admin/kundali', label: '✦ Upload Kundali' },
              { href: '/admin/availability', label: '✦ Manage Slots' },
              { href: '/admin/session-history', label: '✦ Session History' },
              { href: '/admin/settings', label: '✦ Settings' },
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 mystic-card p-6 flex gap-4 items-start"
        >
          <Star size={20} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} fill="currentColor" />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Manage your appointments, upload client Kundali charts, and track your consultation history from this panel.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
