import { NextResponse } from "next/server"
import { prisma, maskEmail } from "@/lib/database"

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: 'desc'
      },
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
        linkedin: true
      }
    })
    
    // Mask emails for privacy
    const maskedApplications = applications.map(app => ({
      ...app,
      applicantEmail: maskEmail(app.applicantEmail),
      sponsorEmail: maskEmail(app.sponsorEmail),
      status: app.status.toLowerCase()
    }))
    
    return NextResponse.json({ 
      success: true, 
      applications: maskedApplications,
      count: applications.length
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
