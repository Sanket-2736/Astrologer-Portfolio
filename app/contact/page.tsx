import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact | Jyotish Acharya',
  description: 'Get in touch for Vedic astrology consultations and inquiries.',
}

export default function ContactPage() {
  return <ContactClient />
}
