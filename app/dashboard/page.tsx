import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = { title: 'My Dashboard | Jyotish Acharya' }

async function getStats(userId: string) {
  try {
    await connectDB()
    // Dynamic imports to avoid model registration issues
    const Appointment = (await import('@/models/Appointment')).default
    const Kundali = (await import('@/models/Kundali')).default

    const [upcoming, past, kundalis] = await Promise.all([
      Appointment.countDocuments({ clientId: userId, status: 'confirmed', date: { $gte: new Date() } }),
      Appointment.countDocuments({ clientId: userId, status: 'completed' }),
      Kundali.countDocuments({ clientId: userId }),
    ])
    return { upcoming, past, kundalis }
  } catch {
    return { upcoming: 0, past: 0, kundalis: 0 }
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login')

  const stats = await getStats(session.userId)

  return <DashboardClient session={session} stats={stats} />
}
