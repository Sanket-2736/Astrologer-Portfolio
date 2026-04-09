import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = { title: 'My Profile | Jyotish Acharya' }

export default async function ProfilePage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login')

  await connectDB()
  const user = await User.findById(session.userId).lean()
  if (!user) redirect('/login')

  const u = user as {
    _id: unknown; name: string; email: string; phone: string;
    dateOfBirth: string; placeOfBirth: string
  }

  return (
    <ProfileClient
      userId={session.userId}
      initialData={{
        name: u.name,
        email: u.email,
        phone: u.phone,
        dateOfBirth: u.dateOfBirth,
        placeOfBirth: u.placeOfBirth,
      }}
    />
  )
}
