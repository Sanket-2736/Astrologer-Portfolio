import mongoose, { Schema, Document } from 'mongoose'

export interface ISlot extends Document {
  dayOfWeek: number // 0=Sun … 6=Sat
  startTime: string // HH:mm
  endTime: string   // HH:mm
  isActive: boolean
  blockedDates: Date[]
}

const SlotSchema = new Schema<ISlot>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    blockedDates: [{ type: Date }],
  },
  { timestamps: true }
)

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema)
