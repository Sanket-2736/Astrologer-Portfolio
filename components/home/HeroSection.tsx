'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ChevronDown } from 'lucide-react'
import { useMemo } from 'react'

export default function HeroSection() {
  // Generate stars once on mount to avoid hydration mismatch
  const stars = useMemo(() => {
    return [...Array(40)].map((_, i) => {
      // Use a seeded random based on index for consistent SSR/client rendering
      const seed = i * 9301 + 49297
      const random1 = (seed % 233280) / 233280
      const random2 = ((seed * 2) % 233280) / 233280
      const random3 = ((seed * 3) % 233280) / 233280
      const random4 = ((seed * 4) % 233280) / 233280
      
      return {
        width: random1 * 2 + 1,
        height: random2 * 2 + 1,
        top: random3 * 100,
        left: random4 * 100,
        opacity: (random1 * 0.6) + 0.2,
      }
    })
  }, [])

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
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              top: star.top + '%',
              left: star.left + '%',
              background: 'var(--gold-light)',
              opacity: star.opacity,
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
