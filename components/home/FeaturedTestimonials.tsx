import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'

async function getFeatured() {
  try {
    await connectDB()
    const docs = await Testimonial.find().sort({ createdAt: -1 }).limit(3).lean()
    return JSON.parse(JSON.stringify(docs))
  } catch {
    return []
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </div>
  )
}

// Fallback testimonials when DB is empty
const fallback = [
  { _id: '1', name: 'Priya Sharma', rating: 5, message: 'The birth chart reading was incredibly accurate. It gave me clarity about my career path and personal relationships. Highly recommended!' },
  { _id: '2', name: 'Rahul Verma', rating: 5, message: 'I was skeptical at first, but the yearly prediction was spot on. The guidance helped me make the right decisions at the right time.' },
  { _id: '3', name: 'Anita Patel', rating: 5, message: 'The kundali matching service was thorough and insightful. We felt very confident about our compatibility after the consultation.' },
]

export default async function FeaturedTestimonials() {
  const raw = await getFeatured()
  const testimonials = raw.length > 0 ? raw : fallback

  return (
    <section
      className="py-20 px-4"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
          >
            Client Stories
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            What Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t: { _id: string; name: string; rating: number; message: string }) => (
            <div key={t._id} className="mystic-card p-6 flex flex-col gap-4">
              <Stars rating={t.rating} />
              <p className="text-sm leading-relaxed italic flex-1" style={{ color: 'var(--text-muted)' }}>
                &ldquo;{t.message}&rdquo;
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-cinzel)' }}
              >
                — {t.name}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/testimonials"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105"
            style={{ border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold-light)' }}
          >
            Read All Reviews →
          </Link>
        </div>
      </div>
    </section>
  )
}
