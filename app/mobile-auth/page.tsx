"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function MobileAuthContent() {
  const searchParams = useSearchParams()
  const [redirected, setRedirected] = useState(false)
  
  useEffect(() => {
    // Get the auth parameters from the URL
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl')
    
    if (token && email && !redirected) {
      setRedirected(true)
      
      // Check if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // Try to open the iOS app with the authentication parameters
        const appUrl = `iman-auth://authenticate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl || '/')}`
        
        console.log('Attempting to open app:', appUrl)
        
        // Try to open the app
        window.location.href = appUrl
        
        // Fallback: if the app doesn't open in 3 seconds, redirect to web version
        setTimeout(() => {
          if (document.hasFocus()) {
            console.log('App did not open, redirecting to web version')
            window.location.href = `/api/auth/callback/resend?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl || '/')}`
          }
        }, 3000)
      } else {
        // Not mobile, redirect to normal web authentication
        window.location.href = `/api/auth/callback/resend?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl || '/')}`
      }
    }
  }, [searchParams, redirected])
  
  if (!searchParams.get('token') || !searchParams.get('email')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Authentication Link</h1>
          <p className="text-gray-600 mb-6">This authentication link is invalid or has expired.</p>
          <a
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Sign In Again
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Opening IMAN App...</h1>
        <p className="text-gray-600 mb-6">
          If the app doesn&apos;t open automatically, you&apos;ll be redirected to the web version.
        </p>
        <p className="text-sm text-gray-500">
          Don&apos;t have the app installed? 
          <a href="/auth/signin" className="text-blue-600 hover:underline ml-1">
            Continue in browser
          </a>
        </p>
      </div>
    </div>
  )
}

export default function MobileAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <MobileAuthContent />
    </Suspense>
  )
}