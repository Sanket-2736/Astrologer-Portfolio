import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    if (session.userId === 'admin') {
      return Response.json({
        notifications: [],
        unreadCount: 0,
      })
    }

    const notifications = await Notification.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const unreadCount = await Notification.countDocuments({
      userId: session.userId,
      isRead: false,
    })

    return Response.json({ notifications: JSON.parse(JSON.stringify(notifications)), unreadCount })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
