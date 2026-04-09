import type { Metadata } from 'next'
import SignupForm from './SignupForm'

export const metadata: Metadata = { title: 'Create Account | Jyotish Acharya' }

export default function SignupPage() {
  return <SignupForm />
}
