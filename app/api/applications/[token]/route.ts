import { NextResponse } from "next/server"
import { prisma, maskEmail } from "@/lib/database"

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params
    const { token } = params

    const application = await prisma.application.findUnique({
      where: { token },
      select: {
        id: true,
        token: true,
        applicantName: true,
        applicantEmail: true,
        sponsorEmail: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        streetAddress: true,
        city: true,
        state: true,
        zip: true,
        professionalQualification: true,
        interest: true,
        contribution: true,
        employer: true,
        linkedin: true,
        verificationCode: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Mask emails for privacy in admin interface
    const maskedApplication = {
      ...application,
      applicantEmail: maskEmail(application.applicantEmail),
      sponsorEmail: maskEmail(application.sponsorEmail),
      status: application.status.toLowerCase()
    }

    return NextResponse.json({
      success: true,
      application: maskedApplication
    })

  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
