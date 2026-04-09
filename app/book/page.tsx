import { redirect } from 'next/navigation'

// Legacy route — redirect to the real booking flow
export default function BookRedirect() {
  redirect('/booking')
}
