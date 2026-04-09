import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Pandit Rajesh Kumar Shastri — 20+ years of Vedic astrology practice, credentials, and approach.',
}

export default function AboutPage() {
  return <AboutClient />
}
