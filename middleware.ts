import { NextRequest, NextResponse } from "next/server"

// 🚨 CRITICAL: DO NOT IMPORT @/auth or any files with "server-only" directive
// This runs in Edge Runtime which doesn't support server-only imports
// Use cookie-based authentication checking only

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/auth/verify-request',
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
  
  // For protected paths, check for session cookie
  const sessionToken = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token')
  
  // If no session token, redirect to sign in
  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

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