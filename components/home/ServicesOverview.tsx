'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Heart, Briefcase, Calendar } from 'lucide-react'

const services = [
  {
    icon: Moon,
    title: 'Birth Chart Reading',
    desc: 'Deep analysis of your natal chart — personality, strengths, karmic patterns, and life purpose.',
    duration: '60 min',
    price: '₹2,500',
  },
  {
    icon: Heart,
    title: 'Compatibility Analysis',
    desc: 'Kundali matching and relationship compatibility for couples and prospective marriages.',
    duration: '45 min',
    price: '₹2,000',
  },
  {
    icon: Briefcase,
    title: 'Career & Finance',
    desc: 'Planetary guidance on career choices, business timing, and financial prosperity.',
    duration: '45 min',
    price: '₹2,000',
  },
  {
    icon: Calendar,
    title: 'Yearly Prediction',
    desc: 'Comprehensive annual forecast covering all life areas based on your Dasha and transits.',
    duration: '75 min',
    price: '₹3,500',
  },
]

export default function ServicesOverview() {
  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
          >
            What I Offer
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Consultation Services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, desc, duration, price }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mystic-card p-6 flex flex-col gap-4 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.1)' }}
              >
                <Icon size={22} style={{ color: 'var(--gold)' }} />
              </div>
              <h3
                className="font-semibold text-base"
                style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                {desc}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{duration}</span>
                <span className="font-semibold gold-text">{price}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105"
            style={{ border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold-light)' }}
          >
            View All Services →
          </Link>
        </div>
      </div>
    </section>
  )
}
