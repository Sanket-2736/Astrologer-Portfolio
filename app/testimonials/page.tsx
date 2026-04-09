import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import TestimonialsClient from './TestimonialsClient'

export const metadata: Metadata = {
  title: 'Testimonials | Jyotish Acharya',
  description: 'Read what clients say about their Vedic astrology consultations.',
}

const fallback = [
  { _id: '1', name: 'Priya Sharma', rating: 5, message: 'The birth chart reading was incredibly accurate. It gave me clarity about my career path and personal relationships. Highly recommended!' },
  { _id: '2', name: 'Rahul Verma', rating: 5, message: 'I was skeptical at first, but the yearly prediction was spot on. The guidance helped me make the right decisions at the right time.' },
  { _id: '3', name: 'Anita Patel', rating: 5, message: 'The kundali matching service was thorough and insightful. We felt very confident about our compatibility after the consultation.' },
  { _id: '4', name: 'Suresh Nair', rating: 4, message: 'Very detailed career consultation. The timing predictions for my business launch were accurate and the remedies suggested have been helpful.' },
  { _id: '5', name: 'Meera Joshi', rating: 5, message: 'I have consulted many astrologers but none as knowledgeable and compassionate. The gemstone recommendation changed my life.' },
  { _id: '6', name: 'Vikram Singh', rating: 5, message: 'The yearly prediction report was comprehensive and well-written. Every major event mentioned came to pass. Truly gifted astrologer.' },
]

async function getTestimonials() {
  try {
    await connectDB()
    const docs = await Testimonial.find().sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(docs))
  } catch {
    return []
  }
}

export default async function TestimonialsPage() {
  const raw = await getTestimonials()
  const testimonials = raw.length > 0 ? raw : fallback
  return <TestimonialsClient testimonials={testimonials} />
}
