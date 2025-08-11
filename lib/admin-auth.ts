import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Admin credentials - in production, use environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'iman-admin-2024'

// Session management
const ADMIN_SESSION_COOKIE = 'iman-admin-session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface AdminSession {
  username: string
  loginTime: number
  expiresAt: number
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function createAdminSession(username: string): AdminSession {
  const now = Date.now()
  return {
    username,
    loginTime: now,
    expiresAt: now + SESSION_DURATION
  }
}

export function setAdminSessionCookie(session: AdminSession) {
  const cookieStore = cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })
}

export function getAdminSession(): AdminSession | null {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)
    
    if (!sessionCookie?.value) {
      return null
    }

    const session: AdminSession = JSON.parse(sessionCookie.value)
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error parsing admin session:', error)
    return null
  }
}

export function clearAdminSession() {
  const cookieStore = cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export function isAdminAuthenticated(): boolean {
  const session = getAdminSession()
  return session !== null
}

// For API routes
export function validateAdminRequest(request: NextRequest): AdminSession | null {
  try {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)
    
    if (!sessionCookie?.value) {
      return null
    }

    const session: AdminSession = JSON.parse(sessionCookie.value)
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error validating admin request:', error)
    return null
  }
}
