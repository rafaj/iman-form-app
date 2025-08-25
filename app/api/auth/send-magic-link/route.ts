import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLinkEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { to, url } = await req.json()
    await sendMagicLinkEmail({ to, url })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to send magic link email:", error)
    return NextResponse.json({ ok: false, error: 'Failed to send magic link email' }, { status: 500 })
  }
}
