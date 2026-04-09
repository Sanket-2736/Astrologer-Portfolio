'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Heart, Briefcase, Calendar, Compass, Gem } from 'lucide-react'

const services = [
  {
    icon: Moon,
    title: 'Birth Chart Reading',
    desc: 'A comprehensive analysis of your natal horoscope covering personality, strengths, weaknesses, karmic patterns, and life purpose. Includes Lagna, Navamsa, and Dashamsa charts.',
    duration: '60 min',
    price: '₹2,500',
    includes: ['Natal chart analysis', 'Dasha & Antardasha', 'Remedies & gemstones', 'Written report'],
  },
  {
    icon: Heart,
    title: 'Compatibility Analysis',
    desc: 'Detailed Kundali matching (Ashtakoot & Dashakoot) for couples and prospective marriages. Includes Mangal Dosha analysis and relationship harmony assessment.',
    duration: '45 min',
    price: '₹2,000',
    includes: ['Ashtakoot matching', 'Mangal Dosha check', 'Relationship forecast', 'Remedies if needed'],
  },
  {
    icon: Briefcase,
    title: 'Career & Finance',
    desc: 'Planetary guidance on career choices, business timing, investment decisions, and financial prosperity based on your 10th, 2nd, and 11th house analysis.',
    duration: '45 min',
    price: '₹2,000',
    includes: ['Career path analysis', 'Business timing', 'Financial forecast', 'Muhurta for ventures'],
  },
  {
    icon: Calendar,
    title: 'Yearly Prediction',
    desc: 'Comprehensive annual forecast covering all life areas — health, wealth, relationships, and career — based on your Dasha, Antardasha, and annual transits.',
    duration: '75 min',
    price: '₹3,500',
    includes: ['12-month forecast', 'Monthly highlights', 'Favorable periods', 'Detailed written report'],
  },
  {
    icon: Compass,
    title: 'Muhurta (Auspicious Timing)',
    desc: 'Selection of the most auspicious date and time for important events — weddings, business launches, property purchases, travel, and more.',
    duration: '30 min',
    price: '₹1,500',
    includes: ['Event-specific timing', 'Panchang analysis', 'Nakshatra selection', 'Alternate dates'],
  },
  {
    icon: Gem,
    title: 'Gemstone Consultation',
    desc: 'Personalized gemstone recommendations based on your birth chart to strengthen beneficial planets and mitigate malefic influences.',
    duration: '30 min',
    price: '₹1,000',
    includes: ['Chart-based analysis', 'Primary gemstone', 'Substitute options', 'Wearing instructions'],
  },
]

export default function ServicesClient() {
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
            Consultations
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Services &amp; Pricing
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            All consultations are conducted via video call. Prices are in INR and include a follow-up
            Q&amp;A session within 48 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, duration, price, includes }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="mystic-card p-6 flex flex-col gap-4 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.1)' }}
                >
                  <Icon size={20} style={{ color: 'var(--gold)' }} />
                </div>
                <span className="text-lg font-bold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
                  {price}
                </span>
              </div>

              <div>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {desc}
                </p>
              </div>

              <ul className="space-y-1">
                {includes.map((item) => (
                  <li key={item} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--gold)' }}>✦</span> {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⏱ {duration}</span>
                <Link
                  href="/booking"
                  className="text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    color: '#0a0a1a',
                  }}
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
