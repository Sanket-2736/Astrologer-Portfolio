'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw, Video } from 'lucide-react'

interface Client { name: string; email: string; phone: string }
interface Booking {
  _id: string
  consultationType: string
  date: string
  timeSlot: string
  durationMins: number
  amountPaid: number
  status: string
  refundStatus?: string
  clientId: Client
  meetingRoomUrl?: string
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#4ade80',
  pending: '#facc15',
  completed: '#818cf8',
  cancelled: '#f87171',
  rescheduled: '#fb923c',
}

export default function AdminBookingsClient({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus && b.status !== filterStatus) return false
      if (filterDate) {
        const bDate = new Date(b.date).toISOString().split('T')[0]
        if (bDate !== filterDate) return false
      }
      return true
    })
  }, [bookings, filterStatus, filterDate])

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking and issue refund?')) return
    setBusy(id)
    setMsg('')
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
      const data = await res.json()
      setMsg(data.success ? '✓ Cancelled. Refund initiated.' : data.error || 'Failed.')
      if (data.success) router.refresh()
    } catch { setMsg('Network error.') }
    finally { setBusy(null) }
  }

  async function handleComplete(id: string) {
    setBusy(id)
    setMsg('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: 'completed' }),
      })
      if (res.ok) { setMsg('✓ Marked as completed.'); router.refresh() }
    } catch { setMsg('Network error.') }
    finally { setBusy(null) }
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

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            All Bookings
          </h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle}>
            <option value="">All Statuses</option>
            {['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
          {(filterStatus || filterDate) && (
            <button onClick={() => { setFilterStatus(''); setFilterDate('') }}
              className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Clear
            </button>
          )}
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            {msg}
          </div>
        )}

        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>

        <div className="flex flex-col gap-4">
          {filtered.map((b, i) => {
            const color = STATUS_COLORS[b.status] ?? '#9ca3af'
            const canAct = ['pending', 'confirmed'].includes(b.status)

            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="mystic-card p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
                      {b.consultationType}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <User size={11} /> {b.clientId?.name ?? 'Unknown'} · {b.clientId?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(b.date).toDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {b.timeSlot} ({b.durationMins}m)
                      </span>
                    </div>
                    <p className="text-xs font-semibold gold-text">₹{b.amountPaid.toLocaleString('en-IN')}</p>
                    {b.refundStatus && b.refundStatus !== 'none' && (
                      <p className="text-xs" style={{ color: '#fb923c' }}>Refund: {b.refundStatus}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${color}20`, color }}
                    >
                      {b.status}
                    </span>
                    {b.status === 'confirmed' && (
                      <Link
                        href={`/consultation/${b._id}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
                      >
                        <Video size={11} /> Start Call
                      </Link>
                    )}
                    {canAct && (
                      <>
                        <button
                          onClick={() => handleComplete(b._id)}
                          disabled={busy === b._id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
                        >
                          <CheckCircle size={11} /> Complete
                        </button>
                        <button
                          onClick={() => handleCancel(b._id)}
                          disabled={busy === b._id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                        >
                          <XCircle size={11} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="mystic-card p-10 text-center">
              <RefreshCw size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No bookings match the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
