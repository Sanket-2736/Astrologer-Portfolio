'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Clock, PhoneOff, Loader2, Video } from 'lucide-react'
import { emailSessionCompleted } from '@/lib/email'

interface Props {
  roomUrl: string       // full Daily room URL e.g. https://yourapp.daily.co/room-name
  token: string         // Daily meeting token (owner or guest)
  roomId: string
  bookingId: string
  role: 'client' | 'astrologer'
  displayName: string
  slotStartISO: string
  slotEndISO: string
  consultationType: string
  clientEmail: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DailyCall = any

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DailyIframe: any
  }
}

function secsUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 1000)
}

function fmt(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

async function completeSession(
  bookingId: string,
  displayName: string,
  clientEmail: string,
  consultationType: string,
) {
  try {
    const res = await fetch('/api/complete-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    const data = await res.json()
    if (data.success) {
      await emailSessionCompleted(displayName, clientEmail, consultationType)
    }
  } catch (e) {
    console.error('completeSession error:', e)
  }
}

export default function DailyRoom({
  roomUrl,
  token,
  bookingId,
  role,
  displayName,
  slotStartISO,
  slotEndISO,
  consultationType,
  clientEmail,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall>(null)
  const completedRef = useRef(false)

  const [phase, setPhase] = useState<'confirm' | 'countdown' | 'loading' | 'live' | 'ended'>('loading')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  const clientInWindow = useCallback(() => {
    const now = Date.now()
    const start = new Date(slotStartISO).getTime() - 10 * 60 * 1000
    const end = new Date(slotEndISO).getTime() + 15 * 60 * 1000
    return now >= start && now <= end
  }, [slotStartISO, slotEndISO])

  useEffect(() => {
    if (role === 'astrologer') {
      setPhase('confirm')
    } else {
      setPhase(clientInWindow() ? 'loading' : 'countdown')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    const tick = () => {
      if (clientInWindow()) { setPhase('loading'); return }
      setCountdown(Math.max(0, secsUntil(slotStartISO) - 10 * 60))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, slotStartISO, clientInWindow])

  // ── Load Daily.co script ──────────────────────────────────────────────
  const loadScript = useCallback((): Promise<void> => {
    if (window.DailyIframe) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/@daily-co/daily-js'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load Daily. Check your internet connection.'))
      document.head.appendChild(s)
    })
  }, [])

  // ── Mount Daily iframe ────────────────────────────────────────────────
  const mountDaily = useCallback(() => {
    if (!containerRef.current) {
      setError('Meeting container not ready. Please refresh.')
      return
    }

    const call: DailyCall = window.DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    })

    callRef.current = call

    call.join({
      url: roomUrl,
      ...(token ? { token } : {}),
      userName: role === 'astrologer' ? `${displayName} (Astrologer)` : displayName,
      startVideoOff: false,
      startAudioOff: false,
    })

    call.on('joined-meeting', () => {
      setPhase('live')
    })

    const doComplete = async () => {
      if (completedRef.current) return
      completedRef.current = true
      setPhase('ended')
      call.destroy()
      if (role === 'astrologer') {
        await completeSession(bookingId, displayName, clientEmail, consultationType)
      }
    }

    call.on('left-meeting', doComplete)

    call.on('error', (e: { errorMsg: string }) => {
      setError(`Meeting error: ${e.errorMsg ?? 'unknown'}`)
    })

    const handleUnload = () => {
      if (completedRef.current) return
      navigator.sendBeacon('/api/complete-session', JSON.stringify({ bookingId }))
    }
    if (role === 'astrologer') {
      window.addEventListener('beforeunload', handleUnload)
    }

    const durationMs =
      new Date(slotEndISO).getTime() - new Date(slotStartISO).getTime() + 15 * 60 * 1000
    const autoTimer = setTimeout(doComplete, durationMs)

    return () => {
      clearTimeout(autoTimer)
      if (role === 'astrologer') window.removeEventListener('beforeunload', handleUnload)
      try { call.destroy() } catch { /* already destroyed */ }
    }
  }, [bookingId, clientEmail, consultationType, displayName, role, roomUrl, token, slotEndISO, slotStartISO])

  const [shouldMount, setShouldMount] = useState(false)

  const handleStartMeeting = useCallback(async () => {
    setError('')
    try {
      await loadScript()
      setPhase('loading')
      setShouldMount(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load meeting')
    }
  }, [loadScript])

  useEffect(() => {
    if (!shouldMount || phase !== 'loading') return
    const t = setTimeout(() => {
      const cleanup = mountDaily()
      if (cleanup) return cleanup
    }, 100)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldMount, phase])

  useEffect(() => {
    if (phase === 'loading' && role === 'client') {
      handleStartMeeting()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Confirm screen (astrologer only) ──────────────────────────────────
  if (phase === 'confirm') {
    const slotDate = new Date(slotStartISO)
    const secsToSlot = secsUntil(slotStartISO)

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 pt-16"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.3) 0%, var(--bg-primary) 70%)' }}
      >
        <div className="text-center max-w-md mystic-card p-10">
          <Video size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Start Meeting Now?
          </h1>
          <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            {consultationType}
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Scheduled: {slotDate.toDateString()} at{' '}
            {slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {secsToSlot > 0 && (
            <p
              className="text-xs mb-6 px-3 py-2 rounded-lg inline-block"
              style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}
            >
              ⏰ {fmt(secsToSlot)} before scheduled time
            </p>
          )}
          {error && (
            <p
              className="text-xs mb-4 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
            >
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={handleStartMeeting}
              className="px-6 py-3 rounded-full font-semibold text-sm tracking-wide transition-all hover:scale-105 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
            >
              <Video size={15} /> Start Meeting
            </button>
            <a
              href="/admin/bookings"
              className="px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Client countdown ──────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 pt-16"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center max-w-md mystic-card p-10">
          <Clock size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Your session starts in
          </h1>
          <p
            className="text-4xl font-bold gold-text mb-4"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            {fmt(countdown)}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            This page will automatically open the meeting 10 minutes before your scheduled time.
          </p>
        </div>
      </div>
    )
  }

  // ── Ended ─────────────────────────────────────────────────────────────
  if (phase === 'ended') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 pt-16"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center max-w-md mystic-card p-10">
          <PhoneOff size={48} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
          <h1
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Session Ended
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Thank you for your {consultationType} consultation.
          </p>
          <a
            href={role === 'astrologer' ? '/admin/bookings' : '/dashboard/my-bookings'}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
          >
            Back to Bookings
          </a>
        </div>
      </div>
    )
  }

  // ── Loading + Live ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#050510' }}>
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ background: 'rgba(10,10,26,0.95)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}
      >
        <p
          className="text-sm font-semibold gold-text"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {consultationType}
        </p>
        <div className="flex items-center gap-3">
          {phase === 'loading' && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={12} className="animate-spin" /> Connecting…
            </span>
          )}
          {phase === 'live' && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
            >
              ● Live
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {role === 'astrologer' ? '🎙 Host' : '👤 Client'} · {displayName}
          </span>
        </div>
      </div>

      <div className="flex-1 relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <p
              className="text-sm px-4 py-3 rounded-lg text-center max-w-sm"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
            >
              {error}
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}