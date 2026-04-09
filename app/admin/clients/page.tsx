import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Appointment from '@/models/Appointment'
import AdminClientsClient from './AdminClientsClient'

export default async function AdminClientsPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()

  const rawClients = await User.find({ role: 'client' })
    .select('name email phone dateOfBirth placeOfBirth createdAt isVerified')
    .sort({ createdAt: -1 })
    .lean()

  // Get booking counts per client in one aggregation
  const bookingCounts = await Appointment.aggregate([
    { $group: { _id: '$clientId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
  ])

  const countMap: Record<string, { total: number; completed: number }> = {}
  for (const b of bookingCounts) {
    countMap[b._id.toString()] = { total: b.total, completed: b.completed }
  }

  const clients = JSON.parse(JSON.stringify(rawClients)).map(
    (c: { _id: string }) => ({
      ...c,
      totalBookings: countMap[c._id]?.total ?? 0,
      completedSessions: countMap[c._id]?.completed ?? 0,
    })
  )

  return <AdminClientsClient clients={clients} />
}
