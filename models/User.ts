import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  role: 'client' | 'astrologer'
  isVerified: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    placeOfBirth: { type: String, required: true },
    role: { type: String, enum: ['client', 'astrologer'], default: 'client' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
