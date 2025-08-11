import { NextRequest, NextResponse } from "next/server"
import { prisma, maskEmail } from "@/lib/database"
import { validateAdminRequest } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = validateAdminRequest(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin login required" },
        { status: 401 }
      )
    }
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
        lastApprovalAt: true
      },
      orderBy: {
        createdAt: 'desc'  // Show newest members first
      }
    })
    
    // For each member, find their approved application by matching email
    const membersWithDetails = await Promise.all(
      activeMembers.map(async (member) => {
        // Find the approved application for this member
        const approvedApplication = await prisma.application.findFirst({
          where: {
            applicantEmail: member.email,
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
            createdAt: true,
            approvedAt: true
          },
          orderBy: {
            approvedAt: 'desc'
          }
        })
        
        return {
          id: member.id,
          name: member.name,
          email: maskEmail(member.email),
          active: member.active,
          createdAt: member.createdAt,
          approvalsInWindow: member.approvalsInWindow,
          lastApprovalAt: member.lastApprovalAt,
          // Application details (if available)
          streetAddress: approvedApplication?.streetAddress || null,
          city: approvedApplication?.city || null,
          state: approvedApplication?.state || null,
          zip: approvedApplication?.zip || null,
          professionalQualification: approvedApplication?.professionalQualification || null,
          interest: approvedApplication?.interest || null,
          contribution: approvedApplication?.contribution || null,
          employer: approvedApplication?.employer || null,
          linkedin: approvedApplication?.linkedin || null,
          applicationDate: approvedApplication?.createdAt || null,
          approvedDate: approvedApplication?.approvedAt || null
        }
      })
    )
    
    // Sort the final result by createdAt descending (newest first)
    membersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
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
