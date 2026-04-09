import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import DailyRoom from './DailyRoom'
import '@/models/User'

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create a Daily meeting token via REST API
// Docs: https://docs.daily.co/reference/rest-api/meeting-tokens/post-meeting-tokens
// ─────────────────────────────────────────────────────────────────────────────
async function createDailyToken({
  roomName,
  userName,
  isOwner,
  expiry,
}: {
  roomName: string
  userName: string
  isOwner: boolean
  expiry: number // Unix timestamp (seconds)
}): Promise<string> {
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        is_owner: isOwner,       // owners can manage the room (mute others, end call, etc.)
        exp: expiry,             // token expiry
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Daily token creation failed: ${err}`)
  }

  const data = await res.json()
  return data.token as string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create (or return existing) a Daily room
// Docs: https://docs.daily.co/reference/rest-api/rooms/post-rooms
// You can skip this if you pre-create rooms in the Daily dashboard.
// ─────────────────────────────────────────────────────────────────────────────
async function getOrCreateDailyRoom(roomName: string, expiry: number): Promise<string> {
  // Try to fetch existing room first
  const getRes = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
  })

  if (getRes.ok) {
    const room = await getRes.json()
    return room.url as string
  }

  // Room doesn't exist — create it
  const createRes = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'public',            // top-level field, not inside properties
      properties: {
        exp: expiry,                  // room auto-deletes after this time
        enable_prejoin_ui: false,     // skip Daily's lobby screen
        enable_knocking: false,
        enable_screenshare: true,
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Daily room creation failed: ${err}`)
  }

  const room = await createRes.json()
  return room.url as string
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ConsultationPage(props: any) {
  const { bookingId } = await props.params
  const session = await getSession()
  if (!session) redirect(`/login?returnUrl=/consultation/${bookingId}`)

  await connectDB()
  const raw = await Appointment.findById(bookingId)
    .populate('clientId', 'name email')
    .lean()

  if (!raw) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appt = raw as any

  const isOwner = session.role === 'client' && appt.clientId._id.toString() === session.userId
  const isAstrologer = session.role === 'astrologer'
  if (!isOwner && !isAstrologer) redirect('/dashboard')

  if (!['confirmed', 'completed'].includes(appt.status)) {
    redirect(session.role === 'astrologer' ? '/admin/bookings' : '/dashboard/my-bookings')
  }

  // ── Compute slot times ─────────────────────────────────────────────────
  const [hours, minutes] = (appt.timeSlot as string).split(':').map(Number)
  const slotStart = new Date(appt.date)
  slotStart.setHours(hours, minutes, 0, 0)
  const slotEnd = new Date(slotStart.getTime() + appt.durationMins * 60 * 1000)

  // Add a 20-minute buffer after the slot end for the room/token expiry
  const expiryUnix = Math.floor(slotEnd.getTime() / 1000) + 20 * 60

  // ── Daily room ─────────────────────────────────────────────────────────
  // Room name must be URL-safe. Daily allows alphanumeric + hyphens.
  const roomName = `astro-${bookingId}`

  const roomUrl = await getOrCreateDailyRoom(roomName, expiryUnix)

  // ── Daily meeting token ────────────────────────────────────────────────
  const dailyToken = await createDailyToken({
    roomName,
    userName:
      session.role === 'astrologer'
        ? `${session.name} (Astrologer)`
        : session.name,
    isOwner: session.role === 'astrologer', // astrologer gets owner privileges
    expiry: expiryUnix,
  })

  return (
    <DailyRoom
      roomUrl={roomUrl}
      token={dailyToken}
      roomId={roomName}
      bookingId={bookingId}
      role={session.role}
      displayName={session.name}
      slotStartISO={slotStart.toISOString()}
      slotEndISO={slotEnd.toISOString()}
      consultationType={appt.consultationType}
      clientEmail={appt.clientId.email}
    />
  )
}