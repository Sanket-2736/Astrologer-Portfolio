'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Search } from 'lucide-react'

interface Client { name: string; email: string }
interface Session {
  _id: string
  consultationType: string
  date: string
  timeSlot: string
  durationMins: number
  amountPaid: number
  clientId: Client
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

export default function AdminSessionHistoryClient({ sessions }: { sessions: Session[] }) {
  const [clientSearch, setClientSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const types = useMemo(
    () => [...new Set(sessions.map((s) => s.consultationType))].sort(),
    [sessions]
  )

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (clientSearch) {
        const q = clientSearch.toLowerCase()
        if (!s.clientId.name.toLowerCase().includes(q) && !s.clientId.email.toLowerCase().includes(q)) return false
      }
      if (typeFilter && s.consultationType !== typeFilter) return false
      const d = new Date(s.date)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [sessions, clientSearch, typeFilter, dateFrom, dateTo])

  const totalRevenue = filtered.reduce((sum, s) => sum + s.amountPaid, 0)

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Session History
          </h1>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: filtered.length },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
            { label: 'Unique Clients', value: new Set(filtered.map((s) => s.clientId.email)).size },
          ].map(({ label, value }) => (
            <div key={label} className="mystic-card p-4 text-center">
              <p className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>{value}</p>
              <p className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Search client…" value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '30px' }}
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={inputStyle}>
            <option value="">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }} placeholder="From" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }} placeholder="To" />
          {(clientSearch || typeFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setClientSearch(''); setTypeFilter(''); setDateFrom(''); setDateTo('') }}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="mystic-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {['Client', 'Type', 'Date', 'Time', 'Duration', 'Amount'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wide" style={{ color: 'var(--gold)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.06)' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User size={12} style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{s.clientId.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.clientId.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>{s.consultationType}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(s.date).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {s.timeSlot}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{s.durationMins}m</td>
                  <td className="px-4 py-3 text-xs font-semibold gold-text">₹{s.amountPaid.toLocaleString('en-IN')}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No sessions match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
