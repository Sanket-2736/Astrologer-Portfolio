'use client'

import emailjs from '@emailjs/browser'

const SVC = () => process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const KEY = () => process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
const T_CLIENT = () => process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENT!
const T_ADMIN = () => process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ASTROLOGER!

interface EmailParams {
  toEmail: string
  toName: string
  subject: string
  message: string
}

export async function sendClientEmail(p: EmailParams) {
  console.log("EMAIL FUNCTION CALLED", p);

  return emailjs.send(SVC(), T_CLIENT(), {
    to_email: p.toEmail,
    to_name: p.toName,
    subject: p.subject,
    message: p.message,
  }, KEY())
}

export async function sendAstrologerEmail(p: EmailParams) {
  console.log("EMAIL FUNCTION CALLED", p)

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL_DISPLAY ?? 'admin@jyotishacharya.com'
  return emailjs.send(SVC(), T_ADMIN(), {
    to_email: adminEmail,
    to_name: 'Jyotish Acharya',
    subject: p.subject,
    message: p.message,
  }, KEY())
}

// ── Convenience wrappers ───────────────────────────────────────────────────

export function emailBookingConfirmed(clientName: string, clientEmail: string, service: string, date: string, time: string) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: `Booking Confirmed — ${service}`,
    message: `Dear ${clientName},\n\nYour ${service} consultation has been confirmed.\n\nDate: ${date}\nTime: ${time}\n\nYou will receive a video call link 10 minutes before your session.\n\nWarm regards,\nJyotish Acharya`,
  })
}

export function emailBookingCancelled(clientName: string, clientEmail: string, service: string, date: string, refund: boolean) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: `Booking Cancelled — ${service}`,
    message: `Dear ${clientName},\n\nYour ${service} consultation on ${date} has been cancelled.\n\n${refund ? 'A full refund has been initiated and will reflect in 5–7 business days.' : 'As the cancellation was within 24 hours, no refund is applicable.'}\n\nWarm regards,\nJyotish Acharya`,
  })
}

export function emailRefundIssued(clientName: string, clientEmail: string, amount: number) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: 'Refund Initiated',
    message: `Dear ${clientName},\n\nA refund of ₹${amount.toLocaleString('en-IN')} has been initiated to your original payment method. It will reflect within 5–7 business days.\n\nWarm regards,\nJyotish Acharya`,
  })
}

export function emailSessionReminder(clientName: string, clientEmail: string, service: string, time: string) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: `Reminder: Your session starts in 1 hour — ${service}`,
    message: `Dear ${clientName},\n\nThis is a reminder that your ${service} consultation is scheduled at ${time} today.\n\nPlease join from your bookings page 10 minutes before the session.\n\nWarm regards,\nJyotish Acharya`,
  })
}

export function emailKundaliUploaded(clientName: string, clientEmail: string) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: 'Your Kundali Charts Are Ready',
    message: `Dear ${clientName},\n\nYour Kundali (horoscope) charts have been uploaded and are now available in your dashboard under "My Kundali".\n\nWarm regards,\nJyotish Acharya`,
  })
}

export function emailNewBookingAlert(clientName: string, service: string, date: string, time: string) {
  return sendAstrologerEmail({
    toEmail: '',   // overridden inside sendAstrologerEmail
    toName: 'Jyotish Acharya',
    subject: `New Booking — ${service}`,
    message: `A new booking has been confirmed.\n\nClient: ${clientName}\nService: ${service}\nDate: ${date}\nTime: ${time}\n\nLog in to your admin panel to view details.`,
  })
}

export function emailSessionCompleted(clientName: string, clientEmail: string, service: string) {
  return sendClientEmail({
    toEmail: clientEmail,
    toName: clientName,
    subject: `Session Complete — ${service}`,
    message: `Dear ${clientName},\n\nThank you for your ${service} consultation. We hope it was insightful.\n\nYour session notes and any uploaded Kundali charts are available in your dashboard.\n\nWarm regards,\nJyotish Acharya`,
  })
}
