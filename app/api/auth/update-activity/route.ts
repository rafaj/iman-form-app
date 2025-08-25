import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    // Update lastSeenAt with throttling (only update if more than 5 minutes since last update)
    const now = new Date()
    
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { lastSeenAt: true }
    })
    
    const shouldUpdate = !currentUser?.lastSeenAt || 
      (now.getTime() - currentUser.lastSeenAt.getTime()) > 5 * 60 * 1000 // 5 minutes
    
    if (shouldUpdate) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { lastSeenAt: now }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update user activity:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}