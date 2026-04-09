import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import AdminBookingsClient from './AdminBookingsClient'

export default async function AdminBookingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()
  const raw = await Appointment.find()
    .sort({ date: -1 })
    .populate('clientId', 'name email phone')
    .lean()

  return <AdminBookingsClient bookings={JSON.parse(JSON.stringify(raw))} />
}
