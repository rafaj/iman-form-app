import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

const mentorshipResponseSchema = z.object({
  requestId: z.string(),
  status: z.enum(['ACCEPTED', 'DECLINED']),
  mentorResponse: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = mentorshipResponseSchema.parse(body)

    // Find the mentor's member record
    const mentor = await prisma.member.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true, email: true }
    })

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: "Mentor profile not found" },
        { status: 404 }
      )
    }

    // Find the mentorship request
    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id: validatedData.requestId },
      include: {
        mentor: {
          select: { name: true, email: true, linkedin: true }
        },
        mentee: {
          select: { name: true, email: true, linkedin: true }
        }
      }
    })

    if (!mentorshipRequest) {
      return NextResponse.json(
        { success: false, message: "Mentorship request not found" },
        { status: 404 }
      )
    }

    // Verify the current user is the mentor for this request
    if (mentorshipRequest.mentorId !== mentor.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to respond to this request" },
        { status: 403 }
      )
    }

    // Check if already responded
    if (mentorshipRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: "Request has already been responded to" },
        { status: 400 }
      )
    }

    // Update the mentorship request
    const updatedRequest = await prisma.mentorshipRequest.update({
      where: { id: validatedData.requestId },
      data: {
        status: validatedData.status,
        mentorResponse: validatedData.mentorResponse,
        respondedAt: new Date(),
        contactShared: validatedData.status === 'ACCEPTED'
      }
    })

    // Send email notification to mentee
    const isAccepted = validatedData.status === 'ACCEPTED'
    const emailSubject = isAccepted 
      ? `✅ Your mentorship request was accepted by ${mentorshipRequest.mentor.name}!`
      : `Your mentorship request to ${mentorshipRequest.mentor.name}`

    try {
      await sendEmail({
        to: mentorshipRequest.mentee.email,
        subject: `${emailSubject} - IMAN Professional Network`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${isAccepted ? '#059669' : '#dc2626'};">
              ${isAccepted ? '🎉 Great News!' : 'Update on Your Mentorship Request'}
            </h2>
            
            <p>Hi ${mentorshipRequest.mentee.name},</p>
            
            <p>
              <strong>${mentorshipRequest.mentor.name}</strong> has 
              <strong style="color: ${isAccepted ? '#059669' : '#dc2626'};">${validatedData.status.toLowerCase()}</strong> 
              your mentorship request.
            </p>
            
            ${validatedData.mentorResponse ? `
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Message from ${mentorshipRequest.mentor.name}:</h3>
                <p style="font-style: italic;">"${validatedData.mentorResponse}"</p>
              </div>
            ` : ''}
            
            ${isAccepted ? `
              <div style="background-color: #f0f9f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669;">Contact Information:</h3>
                <p><strong>Email:</strong> ${mentorshipRequest.mentor.email}</p>
                ${mentorshipRequest.mentor.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${mentorshipRequest.mentor.linkedin}" style="color: #059669;">${mentorshipRequest.mentor.linkedin}</a></p>` : ''}
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                  You can now reach out directly to coordinate your mentorship session!
                </p>
              </div>
            ` : ''}
            
            <p>
              <a href="${process.env.NEXTAUTH_URL}/mentorship" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
                 View All Requests
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This email was sent by the IMAN Professional Network. 
              <a href="${process.env.NEXTAUTH_URL}" style="color: #059669;">Visit our website</a>
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send mentorship response email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Mentorship request ${validatedData.status.toLowerCase()} successfully`,
      request: updatedRequest
    })

  } catch (error) {
    console.error('Mentorship response error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid response data',
          errors: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to respond to mentorship request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}