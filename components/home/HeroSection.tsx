'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ChevronDown } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(55,48,163,0.4) 0%, rgba(10,10,26,0) 70%), var(--bg-primary)',
      }}
    >
      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: 'var(--gold-light)',
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles size={16} style={{ color: 'var(--gold)' }} />
            <span
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
            >
              Vedic Astrology &amp; Cosmic Guidance
            </span>
            <Sparkles size={16} style={{ color: 'var(--gold)' }} />
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            <span className="gold-text">Discover Your</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Cosmic Destiny</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Unlock the ancient wisdom of Vedic astrology. Get personalized birth chart readings,
            compatibility analysis, and life guidance from a trusted astrologer with 20+ years of experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-8 py-4 rounded-full font-semibold text-base tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))',
                color: '#0a0a1a',
                boxShadow: '0 0 30px rgba(201,168,76,0.3)',
              }}
            >
              Book a Consultation
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 rounded-full font-semibold text-base tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                border: '1px solid rgba(201,168,76,0.5)',
                color: 'var(--gold-light)',
              }}
            >
              Explore Services
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown
            size={24}
            style={{ color: 'var(--gold)' }}
            className="animate-bounce"
          />
        </motion.div>
      </div>
    </section>
  )
}
