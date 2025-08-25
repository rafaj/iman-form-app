import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/api/auth/',
    '/_next',
    '/favicon.ico',
    '/globals.css',
    '/apply'
  ]
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Check if user is authenticated
  if (!req.auth) {
    // Redirect to sign in page
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Update user's lastSeenAt timestamp for authenticated users
  if (req.auth.user?.email) {
    try {
      await prisma.user.update({
        where: { email: req.auth.user.email },
        data: { lastSeenAt: new Date() }
      })
    } catch (error) {
      // Silently fail - don't block the request if lastSeenAt update fails
      console.error('Failed to update lastSeenAt:', error)
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}