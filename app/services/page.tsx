import type { Metadata } from 'next'
import ServicesClient from './ServicesClient'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Vedic astrology consultation services — birth chart reading, compatibility analysis, career guidance, yearly predictions, Muhurta, and gemstone consultation.',
}

export default function ServicesPage() {
  return <ServicesClient />
}
