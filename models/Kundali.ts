import mongoose, { Schema, Document } from 'mongoose'

export interface IKundaliImage {
  url: string
  publicId: string
  uploadedAt: Date
}

export interface IKundali extends Document {
  clientId: mongoose.Types.ObjectId
  uploadedBy: string
  images: IKundaliImage[]
  notes?: string
  bookingId?: mongoose.Types.ObjectId
  createdAt: Date
}

const KundaliSchema = new Schema<IKundali>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: String, default: 'astrologer' },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
)

KundaliSchema.index({ clientId: 1 })
KundaliSchema.index({ bookingId: 1 })

export default mongoose.models.Kundali ||
  mongoose.model<IKundali>('Kundali', KundaliSchema)
