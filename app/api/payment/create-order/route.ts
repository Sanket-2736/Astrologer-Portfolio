import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getSession } from '@/lib/session'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'client') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { consultationType, durationMins, amountPaid, date, timeSlot } = body

    if (!consultationType || !durationMins || !amountPaid || !date || !timeSlot) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    await connectDB()

    // Check slot not already taken
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const conflict = await Appointment.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    })
    if (conflict) {
      return Response.json({ error: 'Slot already booked' }, { status: 409 })
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: amountPaid * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    // Create pending appointment
    const appointment = await Appointment.create({
      clientId: session.userId,
      date: new Date(date),
      timeSlot,
      consultationType,
      durationMins,
      amountPaid,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: order.id,
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId: appointment._id.toString(),
    })
  } catch (err) {
    console.error('create-order error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
