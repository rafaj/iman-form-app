import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

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

    // Update application status to rejected
    const updatedApplication = await prisma.application.update({
      where: { token },
      data: { 
        status: "REJECTED",
        // You could add a rejectedAt timestamp field if needed
      }
    })

    console.log(`Application ${token} rejected successfully`)

    return NextResponse.json({
      success: true,
      message: "Application rejected successfully",
      application: {
        id: updatedApplication.id,
        token: updatedApplication.token,
        status: updatedApplication.status,
        applicantName: updatedApplication.applicantName,
        applicantEmail: updatedApplication.applicantEmail
      }
    })

  } catch (error) {
    console.error("Error rejecting application:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
