import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata: Metadata = { title: 'Admin Dashboard | Jyotish Acharya' }

async function getAdminStats() {
  try {
    await connectDB()
    const Appointment = (await import('@/models/Appointment')).default
    const User = (await import('@/models/User')).default

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayBookings, totalClients, revenueAgg] = await Promise.all([
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } }),
      User.countDocuments({ role: 'client' }),
      Appointment.aggregate([
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    return {
      todayBookings,
      totalClients,
      totalRevenue: revenueAgg[0]?.total ?? 0,
    }
  } catch {
    return { todayBookings: 0, totalClients: 0, totalRevenue: 0 }
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  const stats = await getAdminStats()
  return <AdminDashboardClient stats={stats} />
}
