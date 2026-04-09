import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'refund_issued' | 'session_reminder' | 'kundali_uploaded'
  message: string
  isRead: boolean
  bookingId?: mongoose.Types.ObjectId
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['booking_confirmed', 'booking_cancelled', 'booking_rescheduled', 'refund_issued', 'session_reminder', 'kundali_uploaded'],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)
