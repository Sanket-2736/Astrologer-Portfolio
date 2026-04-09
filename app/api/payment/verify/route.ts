import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'client') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, appointmentId } =
      await request.json()

    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpaySignature) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await connectDB()
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'confirmed',
        razorpayPaymentId,
        meetingRoomUrl: `astro-${appointmentId}`,
      },
      { new: true }
    )

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return Response.json({ success: true, appointment })
  } catch (err) {
    console.error('verify error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
