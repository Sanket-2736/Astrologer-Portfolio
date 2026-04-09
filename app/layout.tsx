import type { Metadata } from 'next'
import { Cinzel, Lato } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getSession } from '@/lib/session'

const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'], weight: ['400', '600', '700'] })
const lato = Lato({ variable: '--font-lato', subsets: ['latin'], weight: ['300', '400', '700'] })

export const metadata: Metadata = {
  title: {
    default: 'Jyotish Acharya | Vedic Astrologer',
    template: '%s | Jyotish Acharya',
  },
  description: 'Unlock the secrets of your destiny with authentic Vedic astrology consultations — birth chart readings, compatibility, career guidance, and yearly predictions.',
  keywords: ['vedic astrology', 'jyotish', 'birth chart', 'kundali', 'astrologer', 'horoscope'],
  openGraph: {
    siteName: 'Jyotish Acharya',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const navSession = session
    ? { name: session.name, role: session.role }
    : undefined

  return (
    <html lang="en" className={`${cinzel.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-lato), sans-serif' }}>
        <Navbar session={navSession} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
