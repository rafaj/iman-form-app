import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLinkEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Support both old format (url) and new format (redirectUrl, callbackUrl)
    if (body.url) {
      // Legacy format for web clients
      await sendMagicLinkEmail({ to: body.to, url: body.url })
    } else {
      // New format for mobile clients
      const { to, redirectUrl, callbackUrl } = body
      
      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Create the callback URL with the generated token
      const authCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/resend?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}&callbackUrl=${encodeURIComponent(callbackUrl || '/')}`
      
      await sendMagicLinkEmail({ to, url: authCallbackUrl })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to send magic link email:", error)
    return NextResponse.json({ ok: false, error: 'Failed to send magic link email' }, { status: 500 })
  }
}
