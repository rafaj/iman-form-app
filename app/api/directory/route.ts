import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { requireAuth } from "@/lib/auth-utils"

export async function GET() {
  try {
    // Check authentication and member status
    const user = await requireAuth()
    
    // Verify user is a member (either by userId or email)
    const userMember = await prisma.member.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email, active: true }
        ]
      }
    })
    
    if (!userMember && user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Member access required" },
        { status: 403 }
      )
    }

    // Fetch all active members with their linked user data
    const members = await prisma.member.findMany({
      where: {
        active: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            lastSeenAt: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data for directory display
    const directoryMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      // Use OAuth name if available, fallback to member name
      displayName: member.user?.name || member.name,
      image: member.user?.image || null,
      employer: member.employer,
      professionalQualification: member.professionalQualification,
      interest: member.interest,
      contribution: member.contribution,
      linkedin: member.linkedin,
      skills: member.skills,
      school: member.school,
      memberSince: member.createdAt,
      lastSeenAt: member.user?.lastSeenAt || null,
      // Create initials for avatar fallback
      initials: (member.user?.name || member.name)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }))

    return NextResponse.json({
      success: true,
      members: directoryMembers,
      totalCount: directoryMembers.length
    })

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    console.error('❌ Error fetching directory:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch member directory',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}