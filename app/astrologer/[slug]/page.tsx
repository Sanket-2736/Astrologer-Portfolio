import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import Link from 'next/link'
import { Star, Clock, Award, Users, BookOpen } from 'lucide-react'

const SERVICES = [
  { label: 'Birth Chart Reading', duration: '60 min', price: '₹2,500' },
  { label: 'Compatibility Analysis', duration: '45 min', price: '₹2,000' },
  { label: 'Career & Finance', duration: '45 min', price: '₹2,000' },
  { label: 'Yearly Prediction', duration: '75 min', price: '₹3,500' },
  { label: 'Muhurta', duration: '30 min', price: '₹1,500' },
  { label: 'Gemstone Consultation', duration: '30 min', price: '₹1,000' },
]

export async function generateMetadata(
  props: PageProps<'/astrologer/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  const expectedSlug = process.env.ASTROLOGER_SLUG
  if (slug !== expectedSlug) return { title: 'Not Found' }
  return {
    title: 'Pandit Rajesh Kumar Shastri | Vedic Astrologer',
    description: 'Book a Vedic astrology consultation with Pandit Rajesh Kumar Shastri — 20+ years experience in birth chart readings, compatibility, and yearly predictions.',
    openGraph: {
      title: 'Pandit Rajesh Kumar Shastri | Vedic Astrologer',
      description: 'Authentic Vedic astrology consultations. Birth chart, compatibility, career guidance.',
      type: 'profile',
    },
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'} style={{ fontSize: '14px' }}>★</span>
      ))}
    </div>
  )
}

export default async function AstrologerProfilePage(props: PageProps<'/astrologer/[slug]'>) {
  const { slug } = await props.params
  if (slug !== process.env.ASTROLOGER_SLUG) notFound()

  await connectDB()
  const rawTestimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(5).lean()
  const testimonials = JSON.parse(JSON.stringify(rawTestimonials))
  const avgRating = testimonials.length
    ? (testimonials.reduce((s: number, t: { rating: number }) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : '5.0'

  return (
    <div className="pt-20 pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.35) 0%, transparent 70%)' }}
      >
        <div
          className="w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'var(--bg-card)', border: '3px solid rgba(201,168,76,0.4)', boxShadow: '0 0 40px rgba(201,168,76,0.15)' }}
        >
          <Star size={40} style={{ color: 'var(--gold)' }} fill="currentColor" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-cinzel)' }}>
          Pandit Rajesh Kumar Shastri
        </h1>
        <p className="text-base mb-4" style={{ color: 'var(--text-muted)' }}>
          Jyotish Acharya · Vedic Astrologer
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Stars rating={Math.round(parseFloat(avgRating))} />
          <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{avgRating}</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({testimonials.length} reviews)</span>
        </div>
        <Link
          href="/booking"
          className="inline-block px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a', boxShadow: '0 0 24px rgba(201,168,76,0.3)' }}
        >
          Book a Consultation
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10">
          {[
            { icon: Clock, value: '20+', label: 'Years Experience' },
            { icon: Users, value: '5,000+', label: 'Clients Served' },
            { icon: Star, value: avgRating, label: 'Average Rating' },
            { icon: Award, value: '100%', label: 'Authentic Vedic' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="mystic-card p-4 text-center">
              <Icon size={20} style={{ color: 'var(--gold)', margin: '0 auto 8px' }} />
              <p className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mystic-card p-6 mb-8">
          <h2 className="text-lg font-bold mb-3 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>About</h2>
          <p className="text-sm leading-7 mb-3" style={{ color: 'var(--text-muted)' }}>
            Born into a lineage of Vedic scholars in Varanasi, Pandit Rajesh Kumar Shastri has dedicated his life
            to the ancient science of Jyotish. With over 20 years of practice, he has guided thousands through
            life&apos;s most pivotal moments using classical Parashari and Jaimini systems.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div><span style={{ color: 'var(--gold)' }}>Specialisations: </span><span style={{ color: 'var(--text-muted)' }}>Natal Charts, Muhurta, Compatibility, Career</span></div>
            <div><span style={{ color: 'var(--gold)' }}>Languages: </span><span style={{ color: 'var(--text-muted)' }}>Hindi, English, Sanskrit</span></div>
          </div>
        </div>

        {/* Services */}
        <h2 className="text-lg font-bold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
          <BookOpen size={18} className="inline mr-2" />Consultation Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {SERVICES.map((s) => (
            <div key={s.label} className="mystic-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>⏱ {s.duration}</p>
              </div>
              <p className="text-sm font-bold gold-text">{s.price}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-4 gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
              Client Reviews
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {testimonials.map((t: { _id: string; name: string; rating: number; message: string }) => (
                <div key={t._id} className="mystic-card p-5 flex flex-col gap-3">
                  <Stars rating={t.rating} />
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    &ldquo;{t.message}&rdquo;
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-cinzel)' }}>
                    — {t.name}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/booking"
            className="inline-block px-10 py-4 rounded-full font-semibold text-base tracking-wide transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a', boxShadow: '0 0 30px rgba(201,168,76,0.25)' }}
          >
            Book a Consultation
          </Link>
        </div>
      </div>
    </div>
  )
}
