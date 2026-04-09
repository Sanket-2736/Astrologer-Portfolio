import { redirect } from 'next/navigation'

// /admin/appointments → /admin/bookings (same page, different name)
export default function AppointmentsRedirect() {
  redirect('/admin/bookings')
}
