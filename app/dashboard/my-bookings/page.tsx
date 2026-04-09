import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import MyBookingsClient from './MyBookingsClient'

export default async function MyBookingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login')

  await connectDB()
  const raw = await Appointment.find({ clientId: session.userId })
    .sort({ date: -1 })
    .lean()

  return <MyBookingsClient bookings={JSON.parse(JSON.stringify(raw))} />
}
