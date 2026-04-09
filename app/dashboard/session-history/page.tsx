import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Kundali from '@/models/Kundali'
import SessionHistoryClient from './SessionHistoryClient'

export default async function SessionHistoryPage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login')

  await connectDB()
  const [rawSessions, kundali] = await Promise.all([
    Appointment.find({ clientId: session.userId, status: 'completed' })
      .sort({ date: -1 })
      .lean(),
    Kundali.findOne({ clientId: session.userId }).lean(),
  ])

  const kundaliBookingIds = new Set(
    kundali ? [kundali.bookingId?.toString()].filter(Boolean) : []
  )

  const sessions = JSON.parse(JSON.stringify(rawSessions)).map(
    (s: { _id: string }) => ({
      ...s,
      hasKundali: kundaliBookingIds.has(s._id) || !!kundali,
      kundaliId: kundali ? (kundali as { _id: unknown })._id?.toString() : null,
    })
  )

  return <SessionHistoryClient sessions={sessions} />
}
