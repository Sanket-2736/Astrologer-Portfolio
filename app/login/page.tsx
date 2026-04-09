import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Login | Jyotish Acharya' }

export default async function LoginPage(props: PageProps<'/login'>) {
  const { returnUrl } = await props.searchParams
  return <LoginForm returnUrl={typeof returnUrl === 'string' ? returnUrl : '/dashboard'} />
}
