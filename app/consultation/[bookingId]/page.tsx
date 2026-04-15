import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import '@/models/User'
import VideoRoom from './VideoRoom'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Video Consultation | Jyotish Acharya',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function ConsultationPage(props: PageProps<'/consultation/[bookingId]'>) {
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

  const [hours, minutes] = (appt.timeSlot as string).split(':').map(Number)
  const slotStart = new Date(appt.date)
  slotStart.setHours(hours, minutes, 0, 0)
  const slotEnd = new Date(slotStart.getTime() + appt.durationMins * 60 * 1000)

  return (
    <VideoRoom
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
