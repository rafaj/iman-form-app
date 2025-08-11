import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { sendApprovalNotificationEmail } from "@/lib/email"

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { verificationCode } = await request.json()

    // Find the application
    const application = await prisma.application.findUnique({
      where: { token }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Check if application is still pending
    if (application.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: `Application is already ${application.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Check if application has expired
    if (new Date() > application.expiresAt) {
      // Update status to expired
      await prisma.application.update({
        where: { token },
        data: { status: "EXPIRED" }
      })
      
      return NextResponse.json(
        { success: false, message: "Application has expired" },
        { status: 400 }
      )
    }

    // Verify the verification code
    if (application.verificationCode !== verificationCode.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Update application status to approved
    const updatedApplication = await prisma.application.update({
      where: { token },
      data: { 
        status: "APPROVED",
        approvedAt: new Date()
      }
    })

    // Create member record
    const newMember = await prisma.member.upsert({
      where: { email: application.applicantEmail },
      update: {
        active: true,
        name: application.applicantName
      },
      create: {
        name: application.applicantName,
        email: application.applicantEmail,
        active: true
      }
    })

    // Send welcome email with WhatsApp group invite
    try {
      await sendApprovalNotificationEmail({
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        professionalQualification: application.professionalQualification,
        interest: application.interest,
      })
      console.log(`Welcome email with WhatsApp group sent to ${application.applicantEmail}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the approval if email fails
    }

    console.log(`Application ${token} approved successfully via admin interface`)

    return NextResponse.json({
      success: true,
      message: "Application approved successfully",
      application: {
        id: updatedApplication.id,
        token: updatedApplication.token,
        status: updatedApplication.status,
        applicantName: updatedApplication.applicantName,
        applicantEmail: updatedApplication.applicantEmail,
        approvedAt: updatedApplication.approvedAt
      },
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email
      }
    })

  } catch (error) {
    console.error("Error approving application:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
