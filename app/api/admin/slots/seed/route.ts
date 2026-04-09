import { connectDB } from '@/lib/mongodb'
import Slot from '@/models/Slot'
import { getSession } from '@/lib/session'

// Default schedule: Mon–Sat, 9 AM – 6 PM in 30-min slots
function generateSlots() {
  const slots = []
  // 1=Mon … 6=Sat (skip 0=Sun)
  for (let day = 1; day <= 6; day++) {
    // 9:00 to 17:30 start times (last slot 17:30–18:00)
    for (let hour = 9; hour < 18; hour++) {
      for (const min of [0, 30]) {
        if (hour === 17 && min === 30) continue // stop at 18:00
        const startH = String(hour).padStart(2, '0')
        const startM = String(min).padStart(2, '0')
        const endMin = min + 30
        const endH = endMin >= 60 ? hour + 1 : hour
        const endM = endMin >= 60 ? endMin - 60 : endMin
        slots.push({
          dayOfWeek: day,
          startTime: `${startH}:${startM}`,
          endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
          isActive: true,
          blockedDates: [],
        })
      }
    }
  }
  return slots
}

export async function POST() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const existing = await Slot.countDocuments()
    if (existing > 0) {
      return Response.json({ error: 'Slots already exist. Delete them first.' }, { status: 409 })
    }
    const slots = generateSlots()
    await Slot.insertMany(slots)
    return Response.json({ success: true, count: slots.length })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// Delete ALL slots (for reset)
export async function DELETE() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await connectDB()
    await Slot.deleteMany({})
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
