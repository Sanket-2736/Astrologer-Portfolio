'use client'

import Link from 'next/link'
import { Star, Globe, Rss, Share2, Mail } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact' },
  { href: '/book', label: 'Book Appointment' },
]

const socials = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Rss, href: '#', label: 'Blog' },
  { icon: Share2, href: '#', label: 'Social' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} style={{ color: 'var(--gold)' }} fill="currentColor" />
              <span
                className="text-lg font-semibold gold-text tracking-widest"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                Jyotish Acharya
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Guiding souls through the cosmic tapestry of Vedic astrology for over 20 years.
            </p>
            <div className="flex gap-4 mt-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h3
              className="text-sm font-semibold tracking-widest mb-4 uppercase"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact snippet */}
          <div>
            <h3
              className="text-sm font-semibold tracking-widest mb-4 uppercase"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
            >
              Get In Touch
            </h3>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              📧 contact@jyotishacharya.com
            </p>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              📞 +91 98765 43210
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              🕐 Mon–Sat, 9 AM – 7 PM IST
            </p>
          </div>
        </div>

        <div
          className="mt-10 pt-6 text-center text-xs"
          style={{
            borderTop: '1px solid rgba(201,168,76,0.1)',
            color: 'var(--text-muted)',
          }}
        >
          © {new Date().getFullYear()} Jyotish Acharya. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
