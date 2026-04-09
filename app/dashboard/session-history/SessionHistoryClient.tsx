'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, FileImage, AlertCircle } from 'lucide-react'

interface Session {
  _id: string
  consultationType: string
  date: string
  timeSlot: string
  durationMins: number
  amountPaid: number
  hasKundali: boolean
}

export default function SessionHistoryClient({ sessions }: { sessions: Session[] }) {
  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            My Account
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Session History
          </h1>
        </motion.div>

        {sessions.length === 0 ? (
          <div className="mystic-card p-10 text-center">
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No completed sessions yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mystic-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
                    {s.consultationType}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(s.date).toDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {s.timeSlot} · {s.durationMins}m
                    </span>
                  </div>
                  <p className="text-xs font-semibold gold-text">₹{s.amountPaid.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>
                    Completed
                  </span>
                  {s.hasKundali && (
                    <Link
                      href="/dashboard/my-kundali"
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)', border: '1px solid rgba(201,168,76,0.2)' }}
                    >
                      <FileImage size={11} /> View Kundali
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
