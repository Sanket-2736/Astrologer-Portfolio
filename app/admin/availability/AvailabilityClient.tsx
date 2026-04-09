'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CalendarOff, CalendarCheck, Zap, RotateCcw, Loader2 } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Slot {
  _id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  blockedDates: string[]
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

export default function AvailabilityClient({ slots: initial }: { slots: Slot[] }) {
  const router = useRouter()
  const [slots, setSlots] = useState(initial)
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '10:00', endTime: '10:30' })
  const [blockDate, setBlockDate] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function addSlot() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setMsg('✓ Slot added.')
        router.refresh()
        const data = await res.json()
        setSlots((prev) => [...prev, data])
      } else {
        const d = await res.json()
        setMsg(d.error || 'Failed.')
      }
    } catch { setMsg('Network error.') }
    finally { setBusy(false) }
  }

  async function deleteSlot(id: string) {
    if (!confirm('Delete this slot?')) return
    setBusy(true)
    try {
      await fetch(`/api/admin/slots?id=${id}`, { method: 'DELETE' })
      setSlots((prev) => prev.filter((s) => s._id !== id))
      setMsg('✓ Slot deleted.')
    } catch { setMsg('Network error.') }
    finally { setBusy(false) }
  }

  async function blockDateFn() {
    if (!blockDate) return
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/slots/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: blockDate }),
      })
      const d = await res.json()
      setMsg(d.success ? `✓ ${blockDate} blocked.` : d.error || 'Failed.')
      if (d.success) router.refresh()
    } catch { setMsg('Network error.') }
    finally { setBusy(false) }
  }

  async function unblockDateFn() {
    if (!blockDate) return
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/slots/block', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: blockDate }),
      })
      const d = await res.json()
      setMsg(d.success ? `✓ ${blockDate} unblocked.` : d.error || 'Failed.')
      if (d.success) router.refresh()
    } catch { setMsg('Network error.') }
    finally { setBusy(false) }
  }

  const byDay = DAYS.map((_, i) => slots.filter((s) => s.dayOfWeek === i))

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Availability Management
          </h1>
        </motion.div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add slot */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mystic-card p-6">
            <h2 className="text-base font-semibold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
              Add Weekly Slot
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Day</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: +e.target.value }))}
                  style={inputStyle}
                >
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Start</label>
                  <input type="time" value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>End</label>
                  <input type="time" value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <button
                onClick={addSlot} disabled={busy}
                className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
              >
                <Plus size={15} /> Add Slot
              </button>
            </div>
          </motion.div>

          {/* Block date */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mystic-card p-6">
            <h2 className="text-base font-semibold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
              Block / Unblock Date
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Blocking a date disables all slots for that day (holidays, personal time off).
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Date</label>
                <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={blockDateFn} disabled={busy || !blockDate}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                >
                  <CalendarOff size={13} /> Block
                </button>
                <button
                  onClick={unblockDateFn} disabled={busy || !blockDate}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  <CalendarCheck size={13} /> Unblock
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slot grid by day */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <h2 className="text-base font-semibold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
            Weekly Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day, i) => (
              <div key={day} className="mystic-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
                  {day}
                </p>
                {byDay[i].length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No slots</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {byDay[i].map((slot) => (
                      <div key={slot._id} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <button
                          onClick={() => deleteSlot(slot._id)}
                          className="p-1 rounded transition-colors hover:text-red-400"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label="Delete slot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
