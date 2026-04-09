'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, Star, ChevronDown, User, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'
import { logoutAction } from '@/lib/auth-actions'
import NotificationBell from '@/components/NotificationBell'

interface NavSession {
  name: string
  role: 'client' | 'astrologer'
}

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact' },
]

function UserDropdown({ session }: { session: NavSession }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const dashHref = session.role === 'astrologer' ? '/admin/dashboard' : '/dashboard'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200"
        style={{ border: '1px solid rgba(201, 168, 76, 0.3)', color: 'var(--gold-light)' }}
      >
        <User size={14} />
        <span className="max-w-[120px] truncate">{session.name}</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <Link
            href={dashHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5"
            style={{ color: 'var(--text-primary)' }}
          >
            <LayoutDashboard size={14} style={{ color: 'var(--gold)' }} />
            Dashboard
          </Link>
          {session.role === 'client' && (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <User size={14} style={{ color: 'var(--gold)' }} />
                My Profile
              </Link>
              <Link
                href="/dashboard/my-bookings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <BookOpen size={14} style={{ color: 'var(--gold)' }} />
                My Bookings
              </Link>
            </>
          )}
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5"
                style={{ color: '#f87171' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ session }: { session?: NavSession }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10, 10, 26, 0.95)' : 'rgba(10, 10, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Star size={20} style={{ color: 'var(--gold)' }} fill="currentColor" />
            <span className="text-lg font-semibold tracking-widest gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
              Jyotish Acharya
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {publicLinks.map((l) => (
              <Link
                key={l.href} href={l.href}
                className="text-sm tracking-wide transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {l.label}
              </Link>
            ))}

            {session ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <UserDropdown session={session} />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm tracking-wide transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Login
                </Link>
                <Link
                  href="/booking"
                  className="px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu" style={{ color: 'var(--gold)' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3" style={{ background: 'rgba(10,10,26,0.98)' }}>
          {publicLinks.map((l) => (
            <Link
              key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="py-2 text-sm tracking-wide border-b"
              style={{ color: 'var(--text-muted)', borderColor: 'rgba(201,168,76,0.1)' }}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href={session.role === 'astrologer' ? '/admin/dashboard' : '/dashboard'} onClick={() => setOpen(false)}
                className="py-2 text-sm" style={{ color: 'var(--gold-light)' }}>
                Dashboard
              </Link>
              {session.role === 'client' && (
                <Link href="/profile" onClick={() => setOpen(false)} className="py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  My Profile
                </Link>
              )}
              <form action={logoutAction}>
                <button type="submit" className="py-2 text-sm text-left w-full" style={{ color: '#f87171' }}>Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="py-2 text-sm" style={{ color: 'var(--text-muted)' }}>Login</Link>
              <Link href="/booking" onClick={() => setOpen(false)}
                className="mt-2 py-2 text-center rounded-full text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}>
                Book Appointment
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
