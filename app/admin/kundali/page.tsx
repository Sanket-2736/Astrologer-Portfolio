import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Kundali from '@/models/Kundali'
import AdminKundaliClient from './AdminKundaliClient'

export default async function AdminKundaliPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()
  const [rawClients, rawKundalis] = await Promise.all([
    User.find({ role: 'client' }).select('name email').sort({ name: 1 }).lean(),
    Kundali.find().populate('clientId', 'name email').sort({ createdAt: -1 }).lean(),
  ])

  return (
    <AdminKundaliClient
      clients={JSON.parse(JSON.stringify(rawClients))}
      initialKundalis={JSON.parse(JSON.stringify(rawKundalis))}
    />
  )
}
