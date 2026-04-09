import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/session'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await connectDB()
    await Notification.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { isRead: true }
    )
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
