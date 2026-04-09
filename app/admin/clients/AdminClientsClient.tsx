'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, User, Calendar, Phone, MapPin, BookOpen, CheckCircle } from 'lucide-react'

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  createdAt: string
  totalBookings: number
  completedSessions: number
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
}

export default function AdminClientsClient({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    )
  }, [clients, search])

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Manage Clients
          </h1>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Clients', value: clients.length },
            { label: 'Total Bookings', value: clients.reduce((s, c) => s + c.totalBookings, 0) },
            { label: 'Completed Sessions', value: clients.reduce((s, c) => s + c.completedSessions, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="mystic-card p-4 text-center">
              <p className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>{value}</p>
              <p className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: '32px' }}
          />
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Client cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="mystic-card overflow-hidden"
            >
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.1)' }}
                  >
                    <User size={18} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
                      {c.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                  >
                    <BookOpen size={10} /> {c.totalBookings} bookings
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
                  >
                    <CheckCircle size={10} /> {c.completedSessions} sessions
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {expanded === c._id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {expanded === c._id && (
                <div
                  className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}
                >
                  <div className="flex items-center gap-2 pt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Phone size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    {c.phone || '—'}
                  </div>
                  <div className="flex items-center gap-2 pt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    DOB: {c.dateOfBirth || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    {c.placeOfBirth || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    Joined: {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  <div className="sm:col-span-2 flex gap-2 mt-2 flex-wrap">
                    <Link
                      href={`/admin/bookings?client=${c._id}`}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)' }}
                    >
                      View Bookings
                    </Link>
                    <Link
                      href={`/admin/kundali?client=${c._id}`}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      View Kundali
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="mystic-card p-10 text-center">
              <User size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No clients found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
