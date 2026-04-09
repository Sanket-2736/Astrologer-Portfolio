import mongoose, { Schema, Document } from 'mongoose'

export interface IAppointment extends Document {
  clientId: mongoose.Types.ObjectId
  date: Date
  timeSlot: string
  consultationType: string
  durationMins: number
  amountPaid: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  refundId?: string
  refundStatus?: string
  meetingRoomUrl?: string
  cancelledAt?: Date
  cancelledBy?: string
  createdAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    consultationType: { type: String, required: true },
    durationMins: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    refundId: String,
    refundStatus: String,
    meetingRoomUrl: String,
    cancelledAt: Date,
    cancelledBy: String,
  },
  { timestamps: true }
)

AppointmentSchema.index({ clientId: 1, status: 1 })
AppointmentSchema.index({ date: 1, status: 1 })
AppointmentSchema.index({ razorpayOrderId: 1 })

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema)
