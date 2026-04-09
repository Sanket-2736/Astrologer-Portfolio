import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const clientRoutes = ['/dashboard', '/booking', '/profile']
const sharedRoutes = ['/consultation']  // accessible to both client AND astrologer
const adminRoutes = ['/admin/dashboard', '/admin/bookings', '/admin/availability', '/admin/kundali', '/admin/clients', '/admin/appointments', '/admin/session-history', '/admin/settings']
const authRoutes = ['/login', '/signup', '/admin/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  const isClientRoute = clientRoutes.some((r) => pathname.startsWith(r))
  const isSharedRoute = sharedRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session) {
    const dest = session.role === 'astrologer' ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Shared routes — require any valid session (client OR astrologer)
  if (isSharedRoute) {
    if (!session) {
      const url = new URL('/login', request.url)
      url.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect client-only routes
  if (isClientRoute) {
    if (!session) {
      const url = new URL('/login', request.url)
      url.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (session.role !== 'client') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (session.role !== 'astrologer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking/:path*',
    '/profile/:path*',
    '/consultation/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/admin/login',
  ],
}
