import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import User from '@/models/User'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const dateStr = searchParams.get('date')

  try {
    await connectDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    if (session.role === 'client') {
      query.clientId = session.userId
    }
    if (status) query.status = status
    if (dateStr) {
      const d = new Date(dateStr)
      d.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: d, $lte: end }
    }

    const bookings = await Appointment.find(query)
      .sort({ date: -1 })
      .populate('clientId', 'name email phone')
      .lean()

    return Response.json(JSON.parse(JSON.stringify(bookings)))
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { appointmentId, status } = await request.json()
    await connectDB()
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    )
    return Response.json(updated)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
