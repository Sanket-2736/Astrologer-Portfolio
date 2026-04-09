import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import Appointment from '@/models/Appointment'

// Returns dates (next 60 days) that have at least one available slot
export async function GET() {
  try {
    await connectDB()
    const activeSlots = await Slot.find({ isActive: true }).lean()
    if (!activeSlots.length) return Response.json([])

    const activeDays = new Set(activeSlots.map((s) => s.dayOfWeek))

    // Build blocked date set from all slots
    const blockedSet = new Set<string>()
    for (const slot of activeSlots) {
      for (const d of slot.blockedDates) {
        blockedSet.add(new Date(d).toISOString().split('T')[0])
      }
    }

    // Get booked counts per date for next 60 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const future = new Date(today)
    future.setDate(future.getDate() + 60)

    const bookings = await Appointment.find({
      date: { $gte: today, $lte: future },
      status: { $in: ['pending', 'confirmed'] },
    }).lean()

    const bookedCountByDate: Record<string, number> = {}
    for (const b of bookings) {
      const key = new Date(b.date).toISOString().split('T')[0]
      bookedCountByDate[key] = (bookedCountByDate[key] ?? 0) + 1
    }

    // Slot count per day of week
    const slotCountByDay: Record<number, number> = {}
    for (const s of activeSlots) {
      slotCountByDay[s.dayOfWeek] = (slotCountByDay[s.dayOfWeek] ?? 0) + 1
    }

    const availableDates: string[] = []
    const cursor = new Date(today)
    cursor.setDate(cursor.getDate() + 1) // start from tomorrow

    while (cursor <= future) {
      const iso = cursor.toISOString().split('T')[0]
      const dow = cursor.getDay()
      if (activeDays.has(dow) && !blockedSet.has(iso)) {
        const totalSlots = slotCountByDay[dow] ?? 0
        const booked = bookedCountByDate[iso] ?? 0
        if (booked < totalSlots) availableDates.push(iso)
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    return Response.json(availableDates)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
