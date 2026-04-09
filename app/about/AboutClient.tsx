'use client'

import { motion } from 'framer-motion'
import { Award, BookOpen, Star, Users } from 'lucide-react'

const credentials = [
  { icon: Award, label: 'Jyotish Acharya', sub: 'Certified by Bharatiya Vidya Bhavan' },
  { icon: BookOpen, label: 'Vedic Scholar', sub: 'Sanskrit & Shastra studies, Varanasi' },
  { icon: Star, label: '20+ Years', sub: 'Active practice & consultations' },
  { icon: Users, label: '5,000+ Clients', sub: 'Across India and worldwide' },
]

export default function AboutClient() {
  return (
    <div className="pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
          >
            The Astrologer
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            About Me
          </h1>
        </motion.div>

        {/* Bio section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Photo placeholder */}
            <div
              className="w-full aspect-square max-w-sm mx-auto rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--bg-card)',
                border: '2px solid rgba(201,168,76,0.3)',
                boxShadow: '0 0 40px rgba(201,168,76,0.1)',
              }}
            >
              <div className="text-center">
                <Star size={48} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} fill="currentColor" />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Astrologer Photo</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-5"
          >
            <h2
              className="text-2xl font-bold gold-text"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Pandit Rajesh Kumar Shastri
            </h2>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Born into a lineage of Vedic scholars in Varanasi, I have dedicated my life to the
              ancient science of Jyotish — the eye of the Vedas. My journey began at age 12 under
              the tutelage of my grandfather, a renowned astrologer who served the royal families
              of Rajasthan.
            </p>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Over two decades of practice, I have guided thousands of individuals through life&apos;s
              most pivotal moments — career transitions, marriage decisions, health challenges, and
              spiritual growth. My approach blends classical Parashari and Jaimini systems with
              practical, compassionate guidance.
            </p>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              I believe astrology is not about fate — it is about understanding the cosmic energies
              at play so you can make empowered choices. Every chart tells a unique story, and I am
              here to help you read yours.
            </p>
          </motion.div>
        </div>

        {/* Credentials grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {credentials.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="mystic-card p-5 text-center flex flex-col items-center gap-3">
              <Icon size={24} style={{ color: 'var(--gold)' }} />
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}
              >
                {label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Approach */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 mystic-card p-8"
        >
          <h3
            className="text-xl font-bold mb-4 gold-text"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            My Approach to Astrology
          </h3>
          <p className="text-sm leading-7 mb-4" style={{ color: 'var(--text-muted)' }}>
            I follow the classical Brihat Parashara Hora Shastra as my primary text, supplemented
            by Jaimini Sutras for deeper karmic analysis. Each consultation begins with a thorough
            examination of the natal chart, followed by Dasha analysis and current transits to
            provide timely, actionable guidance.
          </p>
          <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
            I do not believe in fear-based predictions. My sessions are collaborative — we explore
            your chart together, identify opportunities and challenges, and develop practical
            strategies aligned with your cosmic blueprint.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
