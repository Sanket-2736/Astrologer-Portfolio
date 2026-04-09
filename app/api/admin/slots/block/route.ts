import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import { getSession } from '@/lib/session'

// Block a specific date across all slots for that day-of-week
export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { date } = await request.json()
    if (!date) return Response.json({ error: 'date required' }, { status: 400 })

    const d = new Date(date)
    const dayOfWeek = d.getDay()

    await connectDB()
    await Slot.updateMany(
      { dayOfWeek, isActive: true },
      { $addToSet: { blockedDates: d } }
    )
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { date } = await request.json()
    const d = new Date(date)
    const dayOfWeek = d.getDay()
    await connectDB()
    await Slot.updateMany({ dayOfWeek }, { $pull: { blockedDates: d } })
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
