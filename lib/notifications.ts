'use server'

import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'

type NotifType = 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'refund_issued' | 'session_reminder' | 'kundali_uploaded'

export async function createNotification(
  userId: string,
  type: NotifType,
  message: string,
  bookingId?: string
) {
  try {
    await connectDB()
    await Notification.create({
      userId,
      type,
      message,
      bookingId: bookingId || undefined,
    })
  } catch (err) {
    console.error('createNotification error:', err)
  }
}
