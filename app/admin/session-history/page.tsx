import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import AdminSessionHistoryClient from './AdminSessionHistoryClient'

export default async function AdminSessionHistoryPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()
  const raw = await Appointment.find({ status: 'completed' })
    .sort({ date: -1 })
    .populate('clientId', 'name email')
    .lean()

  return <AdminSessionHistoryClient sessions={JSON.parse(JSON.stringify(raw))} />
}
