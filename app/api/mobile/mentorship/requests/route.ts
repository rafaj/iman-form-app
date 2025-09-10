import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { z } from "zod"

const requestQuerySchema = z.object({
  userEmail: z.string().email(),
  type: z.enum(['sent', 'received', 'all']).optional().default('all')
})

export async function GET(request: NextRequest) {
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

    console.log('📱 Mobile mentorship requests API accessed')

    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const type = searchParams.get('type') || 'all'

    const validatedData = requestQuerySchema.parse({ userEmail, type })

    // Find the member by email
    const member = await prisma.member.findUnique({
      where: { email: validatedData.userEmail },
      select: { id: true }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member profile not found" },
        { status: 404 }
      )
    }

    let whereClause: {
      menteeId?: string;
      mentorId?: string;
      OR?: Array<{ menteeId: string } | { mentorId: string }>;
    } = {}
    
    if (validatedData.type === 'sent') {
      whereClause = { menteeId: member.id }
    } else if (validatedData.type === 'received') {
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

    // Transform for mobile response
    const mobileRequests = mentorshipRequests.map(request => ({
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
      // Helper fields for mobile UI
      isSentByMe: request.menteeId === member.id,
      isReceivedByMe: request.mentorId === member.id
    }))

    console.log(`✅ Mobile mentorship requests: returning ${mobileRequests.length} requests`)

    return NextResponse.json({
      success: true,
      requests: mobileRequests,
      summary: {
        total: mobileRequests.length,
        pending: mobileRequests.filter(r => r.status === 'PENDING').length,
        accepted: mobileRequests.filter(r => r.status === 'ACCEPTED').length,
        declined: mobileRequests.filter(r => r.status === 'DECLINED').length
      }
    })

  } catch (error) {
    console.error('❌ Mobile mentorship requests error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid query parameters',
          errors: error.issues
        },
        { status: 400 }
      )
    }

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