'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { createSession, deleteSession } from '@/lib/session'

// ── Types ──────────────────────────────────────────────────────────────────
export type AuthState = {
  errors?: Record<string, string[]>
  message?: string
} | undefined

// ── Client Signup ──────────────────────────────────────────────────────────
export async function signupAction(state: AuthState, formData: FormData): Promise<AuthState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const phone = (formData.get('phone') as string)?.trim()
  const dateOfBirth = formData.get('dateOfBirth') as string
  const placeOfBirth = (formData.get('placeOfBirth') as string)?.trim()

  // Basic validation
  const errors: Record<string, string[]> = {}
  if (!name || name.length < 2) errors.name = ['Name must be at least 2 characters.']
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Enter a valid email.']
  if (!password || password.length < 8) errors.password = ['Password must be at least 8 characters.']
  if (!phone || phone.length < 7) errors.phone = ['Enter a valid phone number.']
  if (!dateOfBirth) errors.dateOfBirth = ['Date of birth is required.']
  if (!placeOfBirth) errors.placeOfBirth = ['Place of birth is required.']

  if (Object.keys(errors).length > 0) return { errors }

  try {
    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) return { errors: { email: ['An account with this email already exists.'] } }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name, email, password: hashedPassword, phone, dateOfBirth, placeOfBirth, role: 'client',
    })

    await createSession({ userId: user._id.toString(), role: 'client', name: user.name })
  } catch (err) {
    console.error('Signup error:', err)
    return { message: 'Something went wrong. Please try again.' }
  }

  redirect('/dashboard')
}

// ── Client Login ───────────────────────────────────────────────────────────
export async function loginAction(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const returnUrl = (formData.get('returnUrl') as string) || '/dashboard'

  if (!email || !password) {
    return { message: 'Email and password are required.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  try {
    await connectDB()

    if (email === adminEmail) {
      if (password !== adminPassword) {
        return { message: 'Invalid email or password.' }
      }

      await createSession({
        userId: 'admin',
        role: 'astrologer',
        name: 'Jyotish Acharya',
      })

      redirect('/admin/dashboard')
      return
    }

    const user = await User.findOne({ email, role: 'client' })
    if (!user) return { message: 'Invalid email or password.' }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { message: 'Invalid email or password.' }

    await createSession({
      userId: user._id.toString(),
      role: 'client',
      name: user.name,
    })

  } catch (err) {
    console.error('Login error:', err)
    return { message: 'Something went wrong. Please try again.' }
  }

  redirect(returnUrl.startsWith('/') ? returnUrl : '/dashboard')
}

// ── Astrologer Login ───────────────────────────────────────────────────────
export async function adminLoginAction(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) return { message: 'Email and password are required.' }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  console.log("Email: ", adminEmail, "Password: ", password)

  if (email !== adminEmail || password !== adminPassword) {
    return { message: 'Invalid credentials.' }
  }

  await createSession({ userId: 'admin', role: 'astrologer', name: 'Jyotish Acharya' })
  redirect('/admin/dashboard')
}

// ── Logout ─────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}

// ── Update Profile ─────────────────────────────────────────────────────────
export async function updateProfileAction(state: AuthState, formData: FormData): Promise<AuthState> {
  const userId = formData.get('userId') as string
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const dateOfBirth = formData.get('dateOfBirth') as string
  const placeOfBirth = (formData.get('placeOfBirth') as string)?.trim()

  const errors: Record<string, string[]> = {}
  if (!name || name.length < 2) errors.name = ['Name must be at least 2 characters.']
  if (!phone) errors.phone = ['Phone is required.']
  if (!dateOfBirth) errors.dateOfBirth = ['Date of birth is required.']
  if (!placeOfBirth) errors.placeOfBirth = ['Place of birth is required.']
  if (Object.keys(errors).length > 0) return { errors }

  try {
    await connectDB()
    await User.findByIdAndUpdate(userId, { name, phone, dateOfBirth, placeOfBirth })
    // Refresh session name
    await createSession({ userId, role: 'client', name })
  } catch (err) {
    console.error('Profile update error:', err)
    return { message: 'Failed to update profile.' }
  }

  return { message: 'Profile updated successfully.' }
}
