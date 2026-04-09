import mongoose, { Schema, Document } from 'mongoose'

export interface IAstrologerSettings extends Document {
  bio: string
  tagline: string
  photoUrl?: string
  photoPublicId?: string
  yearsExperience: number
  specialisations: string[]
  languages: string[]
  pricing: { service: string; price: number }[]
}

const SettingsSchema = new Schema<IAstrologerSettings>(
  {
    bio: { type: String, default: '' },
    tagline: { type: String, default: 'Jyotish Acharya · Vedic Astrologer' },
    photoUrl: String,
    photoPublicId: String,
    yearsExperience: { type: Number, default: 20 },
    specialisations: [{ type: String }],
    languages: [{ type: String }],
    pricing: [{ service: String, price: Number }],
  },
  { timestamps: true }
)

export default mongoose.models.AstrologerSettings ||
  mongoose.model<IAstrologerSettings>('AstrologerSettings', SettingsSchema);