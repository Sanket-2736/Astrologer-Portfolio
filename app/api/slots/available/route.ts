import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import Appointment from '@/models/Appointment'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  if (!dateStr) return Response.json({ error: 'date required' }, { status: 400 })

  try {
    await connectDB()
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()

    // Get active slots for this day
    const slots = await Slot.find({ dayOfWeek, isActive: true }).lean()

    // Filter out slots blocked on this specific date
    const dateOnly = dateStr.split('T')[0]
    const available = slots.filter((slot) => {
      const blocked = slot.blockedDates.some(
        (d: Date) => new Date(d).toISOString().split('T')[0] === dateOnly
      )
      return !blocked
    })

    // Get already-booked slots for this date
    const startOfDay = new Date(dateStr)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateStr)
    endOfDay.setHours(23, 59, 59, 999)

    const booked = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).lean()

    const bookedSlots = new Set(booked.map((b) => b.timeSlot))

    const result = available.map((s) => ({
      _id: s._id,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: bookedSlots.has(s.startTime),
    }))

    return Response.json(result)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
