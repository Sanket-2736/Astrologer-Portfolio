'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Wifi, WifiOff } from 'lucide-react'
import { emailSessionCompleted } from '@/lib/email'

interface Props {
  bookingId: string
  role: 'client' | 'astrologer'
  displayName: string
  slotStartISO: string
  slotEndISO: string
  consultationType: string
  clientEmail: string
}

type Phase = 'confirm' | 'countdown' | 'connecting' | 'waiting' | 'live' | 'ended'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
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

export default function VideoRoom({
  bookingId, role, displayName,
  slotStartISO, slotEndISO, consultationType, clientEmail,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const completedRef = useRef(false)
  const remoteSocketIdRef = useRef<string | null>(null)

  const [phase, setPhase] = useState<Phase>('confirm')
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [statusMsg, setStatusMsg] = useState('Connecting…')
  const [remoteName, setRemoteName] = useState('')
  const [error, setError] = useState('')

  const clientInWindow = useCallback(() => {
    const now = Date.now()
    return now >= new Date(slotStartISO).getTime() - 10 * 60 * 1000 &&
           now <= new Date(slotEndISO).getTime() + 15 * 60 * 1000
  }, [slotStartISO, slotEndISO])

  // ── Session completion ─────────────────────────────────────────────────
  const doComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true
    setPhase('ended')
    if (role === 'astrologer') {
      try {
        await fetch('/api/complete-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        })
        await emailSessionCompleted(displayName, clientEmail, consultationType)
      } catch (e) { console.error(e) }
    }
  }, [bookingId, clientEmail, consultationType, displayName, role])

  // ── Cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    socketRef.current?.disconnect()
    pcRef.current = null
    socketRef.current = null
    localStreamRef.current = null
  }, [])

  // ── Create RTCPeerConnection ───────────────────────────────────────────
  const createPC = useCallback((targetSocketId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    pcRef.current = pc

    // Add local tracks
    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!))

    // Remote stream → remote video
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0]
        setPhase('live')
        setStatusMsg('Connected')
      }
    }

    // ICE candidates → send to peer
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetSocketId,
          candidate: e.candidate,
        })
      }
    }

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') { setPhase('live'); setStatusMsg('Connected') }
      if (state === 'disconnected' || state === 'failed') {
        setStatusMsg('Connection lost')
        setError('Peer disconnected. Please refresh.')
      }
    }

    return pc
  }, [])

  // ── Start the call ─────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    setPhase('connecting')
    setError('')

    // 1. Get local media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.muted = true // prevent echo
      }
    } catch {
      setError('Camera/microphone access denied. Please allow permissions and refresh.')
      setPhase(role === 'astrologer' ? 'confirm' : 'countdown')
      return
    }

    // 2. Connect to signaling server
    const socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL!, {
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setStatusMsg('Waiting for other participant…')
      setPhase('waiting')
      socket.emit('join-room', { bookingId, role, name: displayName })
    })

    socket.on('connect_error', () => {
      setError('Cannot connect to signaling server. Make sure it is running.')
      setPhase(role === 'astrologer' ? 'confirm' : 'countdown')
    })

    // Other peer joined
    socket.on('user-joined', ({ name }: { name: string }) => {
      setRemoteName(name)
      setStatusMsg(`${name} joined. Setting up call…`)
    })

    // Astrologer initiates offer
    socket.on('ready-to-call', async ({ targetSocketId }: { targetSocketId: string }) => {
      remoteSocketIdRef.current = targetSocketId
      const pc = createPC(targetSocketId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('call-user', { targetSocketId, offer })
      setStatusMsg('Calling…')
    })

    // Client receives offer → sends answer
    socket.on('incoming-call', async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      remoteSocketIdRef.current = from
      const pc = createPC(from)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('call-accepted', { targetSocketId: from, answer })
      setStatusMsg('Connecting…')
    })

    // Astrologer receives answer
    socket.on('call-answered', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
    })

    // ICE candidates
    socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (e) { console.error('ICE error:', e) }
    })

    // Remote ended call
    socket.on('call-ended', () => { cleanup(); doComplete() })
    socket.on('peer-disconnected', () => {
      setStatusMsg('Other participant left')
      setError('The other participant has disconnected.')
    })

    // beforeunload beacon
    const handleUnload = () => {
      navigator.sendBeacon('/api/complete-session', JSON.stringify({ bookingId }))
    }
    window.addEventListener('beforeunload', handleUnload)

    // Auto-complete timer
    const durationMs = new Date(slotEndISO).getTime() - Date.now() + 15 * 60 * 1000
    const autoTimer = setTimeout(doComplete, Math.max(durationMs, 0))

    return () => {
      clearTimeout(autoTimer)
      window.removeEventListener('beforeunload', handleUnload)
      cleanup()
    }
  }, [bookingId, cleanup, createPC, displayName, doComplete, role, slotEndISO])

  // Client: auto-start when in window
  useEffect(() => {
    if (role === 'client') {
      if (clientInWindow()) {
        startCall()
      } else {
        setPhase('countdown')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Client countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    const tick = () => {
      if (clientInWindow()) { startCall(); return }
      setCountdown(Math.max(0, secsUntil(slotStartISO) - 10 * 60))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, slotStartISO, clientInWindow, startCall])

  // Controls
  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = muted; })
    setMuted(!muted)
  }

  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOff; })
    setCamOff(!camOff)
  }

  function endCall() {
    if (socketRef.current && remoteSocketIdRef.current) {
      socketRef.current.emit('end-call', { bookingId })
    }
    cleanup()
    doComplete()
  }

  // ── Confirm (astrologer) ───────────────────────────────────────────────
  if (phase === 'confirm') {
    const secsToSlot = secsUntil(slotStartISO)
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.3) 0%, var(--bg-primary) 70%)' }}>
        <div className="text-center max-w-md mystic-card p-10">
          <Video size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Start Meeting Now?
          </h1>
          <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{consultationType}</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Scheduled: {new Date(slotStartISO).toDateString()} at{' '}
            {new Date(slotStartISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {secsToSlot > 0 && (
            <p className="text-xs mb-5 px-3 py-2 rounded-lg inline-block"
              style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}>
              ⏰ {fmt(secsToSlot)} before scheduled time
            </p>
          )}
          {error && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{error}</p>}
          <div className="flex gap-3 justify-center mt-2">
            <button onClick={startCall}
              className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}>
              <Video size={15} /> Start Meeting
            </button>
            <a href="/admin/bookings"
              className="px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}>
              Cancel
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Countdown (client) ─────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mystic-card p-10">
          <Clock size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Your session starts in
          </h1>
          <p className="text-4xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>
            {fmt(countdown)}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Meeting room opens 10 minutes before your scheduled time.
          </p>
        </div>
      </div>
    )
  }

  // ── Ended ──────────────────────────────────────────────────────────────
  if (phase === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mystic-card p-10">
          <PhoneOff size={48} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Session Ended
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Thank you for your {consultationType} consultation.
          </p>
          <a href={role === 'astrologer' ? '/admin/bookings' : '/dashboard/my-bookings'}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}>
            Back to Bookings
          </a>
        </div>
      </div>
    )
  }

  // ── Live / Connecting / Waiting ────────────────────────────────────────
  const isConnected = phase === 'live'

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#050510' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 z-10"
        style={{ background: 'rgba(10,10,26,0.95)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <p className="text-sm font-semibold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
          {consultationType}
        </p>
        <div className="flex items-center gap-3">
          {isConnected
            ? <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                <Wifi size={11} /> Connected
              </span>
            : <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                <WifiOff size={11} /> {statusMsg}
              </span>
          }
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {role === 'astrologer' ? '🎙 Astrologer' : '👤 Client'} · {displayName}
          </span>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#0a0a14' }}>
        {/* Remote video — full screen */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: isConnected ? 'block' : 'none' }}
        />

        {/* Waiting overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)' }}>
              <Video size={28} style={{ color: 'var(--gold)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{statusMsg}</p>
            {remoteName && (
              <p className="text-xs" style={{ color: 'var(--gold)' }}>{remoteName} is in the room</p>
            )}
            {error && <p className="text-xs max-w-xs text-center" style={{ color: '#f87171' }}>{error}</p>}
          </div>
        )}

        {/* Remote name label */}
        {isConnected && remoteName && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            {remoteName}
          </div>
        )}

        {/* Self video — floating bottom-right */}
        <div className="absolute bottom-20 right-4 rounded-xl overflow-hidden shadow-2xl"
          style={{ width: '160px', height: '120px', border: '2px solid rgba(201,168,76,0.3)', background: '#111' }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {camOff && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: '#111' }}>
              <VideoOff size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <div className="absolute bottom-1 left-0 right-0 text-center text-xs"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 flex-shrink-0"
        style={{ background: 'rgba(10,10,26,0.95)', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        {/* Mic */}
        <button onClick={toggleMic}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: muted ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)' }}
          aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted
            ? <MicOff size={20} style={{ color: '#f87171' }} />
            : <Mic size={20} style={{ color: 'var(--text-primary)' }} />}
        </button>

        {/* Camera */}
        <button onClick={toggleCam}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: camOff ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)' }}
          aria-label={camOff ? 'Turn camera on' : 'Turn camera off'}>
          {camOff
            ? <VideoOff size={20} style={{ color: '#f87171' }} />
            : <Video size={20} style={{ color: 'var(--text-primary)' }} />}
        </button>

        {/* End call */}
        <button onClick={endCall}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#ef4444' }}
          aria-label="End call">
          <PhoneOff size={22} style={{ color: '#fff' }} />
        </button>
      </div>
    </div>
  )
}
