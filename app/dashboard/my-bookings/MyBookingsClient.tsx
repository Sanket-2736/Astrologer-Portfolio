'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Video } from 'lucide-react'

interface Booking {
  _id: string
  consultationType: string
  date: string
  timeSlot: string
  durationMins: number
  amountPaid: number
  status: string
  refundStatus?: string
  meetingRoomUrl?: string
}

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  confirmed: { color: '#4ade80', icon: <CheckCircle size={14} /> },
  pending:   { color: '#facc15', icon: <Clock size={14} /> },
  completed: { color: '#818cf8', icon: <CheckCircle size={14} /> },
  cancelled: { color: '#f87171', icon: <XCircle size={14} /> },
  rescheduled: { color: '#fb923c', icon: <RefreshCw size={14} /> },
}

/** Returns seconds until target; negative when past */
function secsUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 1000)
}

function JoinButton({ booking }: { booking: Booking }) {
  const [secs, setSecs] = useState(() => secsUntil(booking.date))

  useEffect(() => {
    const id = setInterval(() => setSecs(secsUntil(booking.date)), 5000)
    return () => clearInterval(id)
  }, [booking.date])

  // Active window: 10 min before slot until slot + duration + 15 min
  const activeIn = secs - 10 * 60
  const isActive = activeIn <= 0 && secs > -(booking.durationMins + 15) * 60

  if (!isActive) {
    const mins = Math.ceil(activeIn / 60)
    return (
      <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Video size={11} className="inline mr-1" />
        {mins > 60 ? `Opens in ${Math.ceil(mins / 60)}h` : `Opens in ${mins}m`}
      </span>
    )
  }

  return (
    <Link
      href={`/consultation/${booking._id}`}
      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 animate-pulse"
      style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }}
    >
      <Video size={11} /> Join Call
    </Link>
  )
}

export default function MyBookingsClient({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function handleCancel(id: string) {
    if (!confirm('Cancel this appointment?')) return
    setCancelling(id)
    setMsg('')
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg(data.eligibleForRefund ? '✓ Cancelled. Refund initiated.' : '✓ Cancelled. No refund (< 24h).')
        router.refresh()
      } else {
        setMsg(data.error || 'Cancellation failed.')
      }
    } catch { setMsg('Network error.') }
    finally { setCancelling(null) }
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            My Account
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            My Bookings
          </h1>
        </motion.div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            {msg}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mystic-card p-10 text-center">
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No bookings yet.</p>
            <Link href="/booking" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}>
              Book Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b, i) => {
              const style = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending
              const apptDate = new Date(b.date)
              const isPast = apptDate < new Date()
              const canCancel = ['pending', 'confirmed'].includes(b.status) && !isPast
              const showJoin = b.status === 'confirmed' && !isPast

              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="mystic-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
                      {b.consultationType}
                    </p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {apptDate.toDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {b.timeSlot} ({b.durationMins}m)</span>
                    </div>
                    <p className="text-xs font-semibold gold-text">₹{b.amountPaid.toLocaleString('en-IN')}</p>
                    {b.refundStatus && b.refundStatus !== 'none' && (
                      <p className="text-xs" style={{ color: '#fb923c' }}>Refund: {b.refundStatus}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${style.color}20`, color: style.color }}
                    >
                      {style.icon} {b.status}
                    </span>
                    {showJoin && <JoinButton booking={b} />}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        disabled={cancelling === b._id}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }}
                      >
                        {cancelling === b._id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
