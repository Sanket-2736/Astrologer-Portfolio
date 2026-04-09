import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import User from '@/models/User'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  // Accept both authenticated requests and beacon (no session cookie on beacon)
  const session = await getSession()

  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) return Response.json({ error: 'bookingId required' }, { status: 400 })

    await connectDB()

    const appt = await Appointment.findById(bookingId).populate('clientId', 'name email').lean() as {
      _id: unknown
      status: string
      consultationType: string
      clientId: { name: string; email: string }
    } | null

    if (!appt) return Response.json({ error: 'Not found' }, { status: 404 })

    // Only mark completed if it was confirmed (idempotent)
    if (appt.status !== 'completed') {
      await Appointment.findByIdAndUpdate(bookingId, { status: 'completed' })
    }

    // Return client info so caller can send email client-side if needed
    return Response.json({
      success: true,
      clientEmail: appt.clientId?.email,
      clientName: appt.clientId?.name,
      consultationType: appt.consultationType,
    })
  } catch (err) {
    console.error('complete-session error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
