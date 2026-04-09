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
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { appointmentId } = await request.json()
    await connectDB()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) return Response.json({ error: 'Not found' }, { status: 404 })

    // Auth check: client can only cancel their own
    if (
      session.role === 'client' &&
      appointment.clientId.toString() !== session.userId
    ) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return Response.json({ error: 'Cannot cancel this booking' }, { status: 400 })
    }

    const now = new Date()
    const apptDate = new Date(appointment.date)
    const hoursUntil = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundId: string | undefined
    let refundStatus = 'none'

    const isAstrologer = session.role === 'astrologer'
    const eligibleForRefund = isAstrologer || hoursUntil > 24

    if (eligibleForRefund && appointment.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(appointment.razorpayPaymentId, {
          amount: appointment.amountPaid * 100,
          speed: 'normal',
          notes: { reason: isAstrologer ? 'Cancelled by astrologer' : 'Client cancellation >24h' },
        })
        refundId = refund.id
        refundStatus = 'initiated'
      } catch (refundErr) {
        console.error('Refund error:', refundErr)
        refundStatus = 'failed'
      }
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'cancelled',
      cancelledAt: now,
      cancelledBy: session.role,
      refundId,
      refundStatus,
    })

    return Response.json({ success: true, refundStatus, eligibleForRefund })
  } catch (err) {
    console.error('cancel error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
