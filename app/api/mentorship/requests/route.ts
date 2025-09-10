import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Find the member
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member profile not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', or 'all'

    let whereClause: any = {}
    
    if (type === 'sent') {
      whereClause = { menteeId: member.id }
    } else if (type === 'received') {
      whereClause = { mentorId: member.id }
    } else {
      whereClause = {
        OR: [
          { menteeId: member.id },
          { mentorId: member.id }
        ]
      }
    }

    // Get mentorship requests
    const mentorshipRequests = await prisma.mentorshipRequest.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            mentorProfile: true,
            employer: true,
            skills: true,
            linkedin: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            menteeProfile: true,
            employer: true,
            skills: true,
            linkedin: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform for response
    const transformedRequests = mentorshipRequests.map(request => ({
      id: request.id,
      status: request.status,
      message: request.message,
      requestType: request.requestType,
      preferredFormat: request.preferredFormat,
      mentorResponse: request.mentorResponse,
      contactShared: request.contactShared,
      createdAt: request.createdAt.toISOString(),
      respondedAt: request.respondedAt?.toISOString() || null,
      mentor: {
        id: request.mentor.id,
        name: request.mentor.name,
        email: request.contactShared ? request.mentor.email : null,
        mentorProfile: request.mentor.mentorProfile,
        employer: request.mentor.employer,
        skills: request.mentor.skills,
        linkedin: request.contactShared ? request.mentor.linkedin : null
      },
      mentee: {
        id: request.mentee.id,
        name: request.mentee.name,
        email: request.contactShared ? request.mentee.email : null,
        menteeProfile: request.mentee.menteeProfile,
        employer: request.mentee.employer,
        skills: request.mentee.skills,
        linkedin: request.contactShared ? request.mentee.linkedin : null
      },
      // Helper fields
      isSentByMe: request.menteeId === member.id,
      isReceivedByMe: request.mentorId === member.id
    }))

    return NextResponse.json({
      success: true,
      requests: transformedRequests,
      summary: {
        total: transformedRequests.length,
        pending: transformedRequests.filter(r => r.status === 'PENDING').length,
        accepted: transformedRequests.filter(r => r.status === 'ACCEPTED').length,
        declined: transformedRequests.filter(r => r.status === 'DECLINED').length
      }
    })

  } catch (error) {
    console.error('Failed to fetch mentorship requests:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch mentorship requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}