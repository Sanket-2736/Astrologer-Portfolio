import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import AvailabilityClient from './AvailabilityClient'

export default async function AvailabilityPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()
  const raw = await Slot.find().sort({ dayOfWeek: 1, startTime: 1 }).lean()
  return <AvailabilityClient slots={JSON.parse(JSON.stringify(raw))} />
}
