import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

const mentorshipRequestSchema = z.object({
  mentorId: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  requestType: z.string().min(1, "Request type is required"),
  preferredFormat: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = mentorshipRequestSchema.parse(body)

    // Find the requesting member
    const mentee = await prisma.member.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true, email: true }
    })

    if (!mentee) {
      return NextResponse.json(
        { success: false, message: "Member profile not found" },
        { status: 404 }
      )
    }

    // Find the mentor
    const mentor = await prisma.member.findUnique({
      where: { id: validatedData.mentorId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        availableAsMentor: true,
        mentorProfile: true
      }
    })

    if (!mentor || !mentor.availableAsMentor) {
      return NextResponse.json(
        { success: false, message: "Mentor not found or not available" },
        { status: 404 }
      )
    }

    // Check for existing request
    const existingRequest = await prisma.mentorshipRequest.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId: validatedData.mentorId,
          menteeId: mentee.id
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "You already have a request with this mentor" },
        { status: 400 }
      )
    }

    // Create mentorship request
    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        mentorId: validatedData.mentorId,
        menteeId: mentee.id,
        message: validatedData.message,
        requestType: validatedData.requestType,
        preferredFormat: validatedData.preferredFormat
      },
      include: {
        mentor: {
          select: { name: true, email: true }
        },
        mentee: {
          select: { name: true, email: true }
        }
      }
    })

    // Send email notification to mentor
    try {
      await sendEmail({
        to: mentor.email,
        subject: `New Mentorship Request from ${mentee.name} - IMAN Professional Network`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">New Mentorship Request</h2>
            
            <p>Hi ${mentor.name},</p>
            
            <p><strong>${mentee.name}</strong> has requested mentorship from you through the IMAN Professional Network.</p>
            
            <div style="background-color: #f0f9f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #059669;">Request Details:</h3>
              <p><strong>Type:</strong> ${validatedData.requestType}</p>
              ${validatedData.preferredFormat ? `<p><strong>Preferred Format:</strong> ${validatedData.preferredFormat}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="font-style: italic; margin-left: 20px;">"${validatedData.message}"</p>
            </div>
            
            <p>You can respond to this request by logging into the IMAN platform:</p>
            <a href="${process.env.NEXTAUTH_URL}/mentorship" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
               View Request
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This email was sent by the IMAN Professional Network. 
              <a href="${process.env.NEXTAUTH_URL}" style="color: #059669;">Visit our website</a>
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send mentorship request email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Mentorship request sent successfully",
      requestId: mentorshipRequest.id
    })

  } catch (error) {
    console.error('Mentorship request creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send mentorship request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}