'use client'

import { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'

const SERVICES = [
  { id: 'birth-chart', label: 'Birth Chart Reading', duration: 60, price: 2500 },
  { id: 'compatibility', label: 'Compatibility Analysis', duration: 45, price: 2000 },
  { id: 'career', label: 'Career & Finance', duration: 45, price: 2000 },
  { id: 'yearly', label: 'Yearly Prediction', duration: 75, price: 3500 },
  { id: 'muhurta', label: 'Muhurta (Auspicious Timing)', duration: 30, price: 1500 },
  { id: 'gemstone', label: 'Gemstone Consultation', duration: 30, price: 1000 },
]

interface TimeSlot { _id: string; startTime: string; endTime: string; isBooked: boolean }

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function BookingFlow({ clientName }: { clientName: string }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState<(typeof SERVICES)[0] | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Load available dates once
  useEffect(() => {
    fetch('/api/slots/available-dates')
      .then((r) => r.json())
      .then(setAvailableDates)
      .catch(console.error)
  }, [])

  // Load slots when date changes
  const loadSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)
    try {
      const iso = date.toISOString().split('T')[0]
      const res = await fetch(`/api/slots/available?date=${iso}`)
      const data = await res.json()
      setSlots(data)
    } catch {
      setError('Failed to load slots.')
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate)
  }, [selectedDate, loadSlots])

  function isDateAvailable(date: Date) {
    const iso = date.toISOString().split('T')[0]
    return availableDates.includes(iso)
  }

  async function handlePayment() {
    if (!service || !selectedDate || !selectedSlot) return
    setPaying(true)
    setError('')

    try {
      // 1. Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationType: service.label,
          durationMins: service.duration,
          amountPaid: service.price,
          date: selectedDate.toISOString(),
          timeSlot: selectedSlot.startTime,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed')

      // 2. Load Razorpay script if needed
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Razorpay script failed'))
          document.body.appendChild(s)
        })
      }

      // 3. Open checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Jyotish Acharya',
          description: service.label,
          order_id: orderData.orderId,
          prefill: { name: clientName },
          theme: { color: '#c9a84c' },
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            // 4. Verify
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                appointmentId: orderData.appointmentId,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setSuccess(true)
              resolve()
            } else {
              reject(new Error('Payment verification failed'))
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        rzp.open()
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      if (msg !== 'Payment cancelled') setError(msg)
    } finally {
      setPaying(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: 'var(--bg-primary)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <CheckCircle size={64} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Booking Confirmed!
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Your {service?.label} on {selectedDate?.toDateString()} at {selectedSlot?.startTime} has been booked.
            A confirmation has been sent to your email.
          </p>
          <a href="/dashboard/my-bookings"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}>
            View My Bookings
          </a>
        </motion.div>
      </div>
    )
  }

  const stepLabel = ['Select Service', 'Choose Date', 'Pick Time Slot', 'Confirm & Pay']

  return (
    <div className="min-h-screen pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {stepLabel.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step > i + 1 ? '#4ade80' : step === i + 1 ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  color: step >= i + 1 ? '#0a0a1a' : 'var(--text-muted)',
                }}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block text-xs" style={{ color: step === i + 1 ? 'var(--gold)' : 'var(--text-muted)' }}>
                {label}
              </span>
              {i < 3 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Service */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
                Select Consultation Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setService(s); setStep(2) }}
                    className="mystic-card p-5 text-left flex flex-col gap-2 transition-all duration-200 hover:scale-105"
                    style={{ border: service?.id === s.id ? '1px solid var(--gold)' : undefined }}
                  >
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>{s.label}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⏱ {s.duration} min</span>
                      <span className="font-bold gold-text text-sm">₹{s.price.toLocaleString('en-IN')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Date */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
                Choose a Date
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Highlighted dates have available slots.
              </p>
              <div className="mystic-card p-6 flex justify-center">
                <style>{`
                  .react-datepicker { background: var(--bg-card) !important; border: 1px solid rgba(201,168,76,0.2) !important; font-family: inherit; }
                  .react-datepicker__header { background: var(--bg-secondary) !important; border-bottom: 1px solid rgba(201,168,76,0.15) !important; }
                  .react-datepicker__current-month, .react-datepicker__day-name { color: var(--gold) !important; }
                  .react-datepicker__day { color: var(--text-muted) !important; border-radius: 50% !important; }
                  .react-datepicker__day:hover { background: rgba(201,168,76,0.15) !important; color: var(--gold-light) !important; }
                  .react-datepicker__day--selected { background: var(--gold) !important; color: #0a0a1a !important; }
                  .react-datepicker__day--disabled { opacity: 0.25 !important; }
                  .react-datepicker__day--highlighted { background: rgba(201,168,76,0.2) !important; color: var(--gold-light) !important; }
                  .react-datepicker__navigation-icon::before { border-color: var(--gold) !important; }
                `}</style>
                <DatePicker
                  inline
                  selected={selectedDate}
                  onChange={(d: Date | null) => { setSelectedDate(d); setStep(3) }}
                  minDate={new Date()}
                  highlightDates={availableDates.map((d) => new Date(d))}
                  filterDate={isDateAvailable}
                />
              </div>
              <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={14} /> Back
              </button>
            </motion.div>
          )}

          {/* Step 3 — Time slot */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
                Pick a Time Slot
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {selectedDate?.toDateString()}
              </p>
              {loadingSlots ? (
                <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
              ) : slots.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot._id}
                      disabled={slot.isBooked}
                      onClick={() => { setSelectedSlot(slot); setStep(4) }}
                      className="py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: slot.isBooked
                          ? 'rgba(255,255,255,0.04)'
                          : selectedSlot?._id === slot._id
                          ? 'var(--gold)'
                          : 'rgba(201,168,76,0.1)',
                        color: slot.isBooked ? 'var(--text-muted)' : selectedSlot?._id === slot._id ? '#0a0a1a' : 'var(--gold-light)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        opacity: slot.isBooked ? 0.4 : 1,
                        cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(2)} className="mt-6 flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={14} /> Back
              </button>
            </motion.div>
          )}

          {/* Step 4 — Confirm & Pay */}
          {step === 4 && service && selectedDate && selectedSlot && (
            <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
                Confirm & Pay
              </h2>
              <div className="mystic-card p-6 flex flex-col gap-4 mb-6">
                {[
                  ['Service', service.label],
                  ['Date', selectedDate.toDateString()],
                  ['Time', `${selectedSlot.startTime} – ${selectedSlot.endTime}`],
                  ['Duration', `${service.duration} minutes`],
                  ['Amount', `₹${service.price.toLocaleString('en-IN')}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {error && <p className="text-sm mb-4 text-center" style={{ color: '#f87171' }}>{error}</p>}

              <button
                onClick={handlePayment}
                disabled={paying}
                className="w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
              >
                {paying && <Loader2 size={16} className="animate-spin" />}
                {paying ? 'Processing…' : `Pay ₹${service.price.toLocaleString('en-IN')}`}
              </button>

              <button onClick={() => setStep(3)} className="mt-4 flex items-center gap-1 text-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={14} /> Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
