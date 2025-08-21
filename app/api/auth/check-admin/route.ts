import { NextResponse } from "next/server"
import { isAdmin, getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    const user = await getCurrentUser()
    const userIsAdmin = await isAdmin()
    
    // Check if user has a linked Member record
    let isMember = false
    if (user?.id) {
      const memberRecord = await prisma.member.findUnique({
        where: { userId: user.id }
      })
      isMember = !!memberRecord
    }
    
    // For now, treat all authenticated users as members to allow forum access
    // This follows the architecture where authenticated users can access the forum
    const hasForumAccess = !!user
    
    return NextResponse.json({ 
      isAdmin: userIsAdmin, 
      isMember: hasForumAccess,
      hasLinkedMemberRecord: isMember
    })
  } catch {
    return NextResponse.json({ isAdmin: false, isMember: false })
  }
}