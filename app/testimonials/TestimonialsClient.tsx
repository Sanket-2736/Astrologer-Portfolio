'use client'

import { motion } from 'framer-motion'

interface Testimonial {
  _id: string
  name: string
  rating: number
  message: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-base">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  )
}

export default function TestimonialsClient({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
          >
            Client Stories
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Testimonials
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="mystic-card p-6 flex flex-col gap-4 transition-all duration-300"
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
