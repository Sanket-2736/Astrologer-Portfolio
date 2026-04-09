import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import BookingFlow from './BookingFlow'

export const metadata: Metadata = { title: 'Book Appointment | Jyotish Acharya' }

export default async function BookingPage() {
  const session = await getSession()
  if (!session || session.role !== 'client') redirect('/login?returnUrl=/booking')
  return <BookingFlow clientName={session.name} />
}
