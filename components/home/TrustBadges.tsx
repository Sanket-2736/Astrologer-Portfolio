'use client'

import { motion } from 'framer-motion'
import { Users, Star, Clock, Award } from 'lucide-react'

const badges = [
  { icon: Users, value: '5,000+', label: 'Clients Served' },
  { icon: Star, value: '4.9 / 5', label: 'Average Rating' },
  { icon: Clock, value: '20+ Years', label: 'Experience' },
  { icon: Award, value: '100%', label: 'Authentic Vedic' },
]

export default function TrustBadges() {
  return (
    <section
      className="py-12"
      style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
    >
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-2"
          >
            <Icon size={28} style={{ color: 'var(--gold)' }} />
            <span
              className="text-2xl font-bold gold-text"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {value}
            </span>
            <span className="text-xs tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
