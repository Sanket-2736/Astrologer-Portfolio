import type { Metadata } from 'next'
import AdminLoginForm from './AdminLoginForm'

export const metadata: Metadata = { title: 'Astrologer Login | Jyotish Acharya' }

export default function AdminLoginPage() {
  return <AdminLoginForm />
}
