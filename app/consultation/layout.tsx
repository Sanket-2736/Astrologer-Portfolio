import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Consultation | Jyotish Acharya',
}

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
