import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import AstrologerSettings from '@/models/AstrologerSettings'
import AdminSettingsClient from './AdminSettingsClient'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'astrologer') redirect('/admin/login')

  await connectDB()
  let settings = await AstrologerSettings.findOne().lean()
  if (!settings) {
    settings = await AstrologerSettings.create({
      bio: 'Born into a lineage of Vedic scholars in Varanasi...',
      tagline: 'Jyotish Acharya · Vedic Astrologer',
      yearsExperience: 20,
      specialisations: ['Natal Charts', 'Muhurta', 'Compatibility', 'Career'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      pricing: [
        { service: 'Birth Chart Reading', price: 2500 },
        { service: 'Compatibility Analysis', price: 2000 },
        { service: 'Career & Finance', price: 2000 },
        { service: 'Yearly Prediction', price: 3500 },
      ],
    })
  }

  return <AdminSettingsClient settings={JSON.parse(JSON.stringify(settings))} />
}
