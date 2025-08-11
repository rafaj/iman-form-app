import { NextResponse } from "next/server"
import { prisma, maskEmail } from "@/lib/database"

export async function GET() {
  try {
    const activeMembers = await prisma.member.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        approvalsInWindow: true,
        lastApprovalAt: true,
        // Get their approved application details
        approvedApplications: {
          where: {
            status: 'APPROVED'
          },
          select: {
            applicantName: true,
            applicantEmail: true,
            streetAddress: true,
            city: true,
            state: true,
            zip: true,
            professionalQualification: true,
            interest: true,
            contribution: true,
            employer: true,
            linkedin: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Get the most recent approved application
        }
      }
    })
    
    // Transform the data to include application details at the top level
    const membersWithDetails = activeMembers.map(member => {
      const latestApplication = member.approvedApplications[0]
      
      return {
        id: member.id,
        name: member.name,
        email: maskEmail(member.email),
        active: member.active,
        createdAt: member.createdAt,
        approvalsInWindow: member.approvalsInWindow,
        lastApprovalAt: member.lastApprovalAt,
        // Application details (if available)
        streetAddress: latestApplication?.streetAddress || null,
        city: latestApplication?.city || null,
        state: latestApplication?.state || null,
        zip: latestApplication?.zip || null,
        professionalQualification: latestApplication?.professionalQualification || null,
        interest: latestApplication?.interest || null,
        contribution: latestApplication?.contribution || null,
        employer: latestApplication?.employer || null,
        linkedin: latestApplication?.linkedin || null,
        applicationDate: latestApplication?.createdAt || null
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      sponsors: membersWithDetails,
      count: membersWithDetails.length
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
