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
        active: true,
        user: {
          role: 'ADMIN'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        approvalsInWindow: true,
        lastApprovalAt: true,
        // Professional info from member table (single source of truth)
        professionalQualification: true,
        interest: true,
        contribution: true,
        employer: true,
        linkedin: true,
        user: {
          select: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'  // Show newest members first
      }
    })
    
    // Get sponsor information from applications (for those who came through application process)
    const membersWithDetails = await Promise.all(
      activeMembers.map(async (member) => {
        // Find their approved application only for sponsor info
        const approvedApplication = await prisma.application.findFirst({
          where: {
            applicantEmail: member.email,
            status: 'APPROVED'
          },
          select: {
            createdAt: true,
            approvedAt: true,
            sponsorEmail: true,
            sponsor: {
              select: {
                name: true,
                email: true
              }
            }
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
          // Professional info from member table (always current)
          professionalQualification: member.professionalQualification,
          interest: member.interest,
          contribution: member.contribution,
          employer: member.employer,
          linkedin: member.linkedin,
          // Application timeline info
          applicationDate: approvedApplication?.createdAt || null,
          approvedDate: approvedApplication?.approvedAt || null,
          // Sponsor information (from application only)
          sponsorEmail: approvedApplication?.sponsorEmail || null,
          sponsorName: approvedApplication?.sponsor?.name || null
        }
      })
    )
    
    // Sort the final result by createdAt descending (newest first)
    membersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({ 
      success: true, 
      sponsors: membersWithDetails,
      count: membersWithDetails.length,
      message: "Only admin members can approve applications"
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
