import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import Kundali from '@/models/Kundali'
import MyKundaliClient from './MyKundaliClient'

export default async function MyKundaliPage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login')

  await connectDB()
  const raw = await Kundali.findOne({ clientId: session.userId }).lean()

  return <MyKundaliClient kundali={raw ? JSON.parse(JSON.stringify(raw)) : null} />
}
