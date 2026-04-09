import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import User from '@/models/User'

// Called by cron or manually by astrologer
// Finds confirmed bookings starting in the next 60–70 minutes and returns their data
// Actual email sending is done client-side via EmailJS (server can't use @emailjs/browser)
// Alternatively call this from a server action that uses nodemailer — here we return the data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Simple shared secret guard for cron calls
  if (secret !== process.env.SESSION_SECRET?.slice(0, 16)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const now = new Date()
    const in60 = new Date(now.getTime() + 60 * 60 * 1000)
    const in70 = new Date(now.getTime() + 70 * 60 * 1000)

    const upcoming = await Appointment.find({
      status: 'confirmed',
      date: { $gte: in60, $lte: in70 },
    })
      .populate('clientId', 'name email')
      .lean()

    return Response.json({ reminders: JSON.parse(JSON.stringify(upcoming)) })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
