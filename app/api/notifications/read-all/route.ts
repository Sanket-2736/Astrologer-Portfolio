import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/session'

export async function PATCH() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    await Notification.updateMany({ userId: session.userId, isRead: false }, { isRead: true })
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
