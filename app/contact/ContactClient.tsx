'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { Send, Mail, Phone, Clock } from 'lucide-react'

export default function ContactClient() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setStatus('sending')
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setStatus('success')
      formRef.current.reset()
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '12px 16px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div className="pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}
          >
            Reach Out
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}
          >
            Contact Me
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Have a question before booking? Want to understand which service suits you best?
              Send me a message and I will get back to you within 24 hours.
            </p>

            {[
              { icon: Mail, label: 'Email', value: 'contact@jyotishacharya.com' },
              { icon: Phone, label: 'Phone / WhatsApp', value: '+91 98765 43210' },
              { icon: Clock, label: 'Consultation Hours', value: 'Mon–Sat, 9 AM – 7 PM IST' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.1)' }}
                >
                  <Icon size={18} style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>
                    {label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="to_name"
                  required
                  placeholder="Your full name"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="to_email"
                  required
                  placeholder="your@email.com"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
              </div>
              {/* hidden subject so template variable is always populated */}
              <input type="hidden" name="subject" value="New Contact Form Message" />
              <div>
                <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="How can I help you?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                  color: '#0a0a1a',
                }}
              >
                <Send size={16} />
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-sm text-center" style={{ color: '#4ade80' }}>
                  ✓ Message sent! I will reply within 24 hours.
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm text-center" style={{ color: '#f87171' }}>
                  Something went wrong. Please try again or email directly.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
