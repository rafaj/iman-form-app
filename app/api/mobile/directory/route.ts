import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: Request) {
  try {
    // Simple API key authentication for mobile
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MOBILE_API_KEY || 'iman-mobile-2024'
    
    if (!authHeader || !authHeader.includes(expectedKey)) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 }
      )
    }

    console.log('📱 Mobile directory API accessed')

    // Fetch active members with their linked user data
    const members = await prisma.member.findMany({
      where: {
        active: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            lastSeenAt: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 50 // Limit for mobile performance
    })

    // Transform data for mobile directory display
    const directoryMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      // Use OAuth name if available, fallback to member name
      displayName: member.user?.name || member.name,
      email: member.user?.email || member.email,
      image: member.user?.image || null,
      employer: member.employer,
      professionalQualification: member.professionalQualification,
      interest: member.interest,
      contribution: member.contribution,
      linkedin: member.linkedin,
      skills: member.skills,
      school: member.school,
      // Mentorship information
      availableAsMentor: member.availableAsMentor,
      mentorProfile: member.mentorProfile,
      seekingMentor: member.seekingMentor,
      menteeProfile: member.menteeProfile,
      memberSince: member.createdAt.toISOString(),
      lastSeenAt: member.user?.lastSeenAt?.toISOString() || null,
      // Create initials for avatar fallback
      initials: (member.user?.name || member.name)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }))

    console.log(`✅ Mobile directory: returning ${directoryMembers.length} members`)

    return NextResponse.json({
      success: true,
      members: directoryMembers,
      totalCount: directoryMembers.length
    })

  } catch (error) {
    console.error('❌ Mobile directory error:', error)
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