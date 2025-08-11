import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { validateAdminRequest } from "@/lib/admin-auth"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Member ID is required" },
        { status: 400 }
      )
    }

    // Find the member first to get details for logging
    const member = await prisma.member.findUnique({
      where: { id },
      select: { id: true, name: true, email: true }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    // Prevent deletion of jafar@jafar.com for safety
    if (member.email === 'jafar@jafar.com') {
      return NextResponse.json(
        { success: false, message: "Cannot delete the primary admin member" },
        { status: 403 }
      )
    }

    // Delete all applications related to this member first
    // (both as sponsor and as applicant)
    const deletedApplications = await prisma.application.deleteMany({
      where: {
        OR: [
          { sponsorMemberId: id },
          { applicantEmail: member.email }
        ]
      }
    })

    // Delete the member
    await prisma.member.delete({
      where: { id }
    })

    console.log(`🗑️ Admin deleted member: ${member.name} (${member.email})`)
    console.log(`🗑️ Also deleted ${deletedApplications.count} related applications`)

    return NextResponse.json({
      success: true,
      message: `Member ${member.name} deleted successfully`,
      deletedMember: {
        id: member.id,
        name: member.name,
        email: member.email
      },
      deletedApplicationsCount: deletedApplications.count
    })

  } catch (error) {
    console.error('❌ Error deleting member:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete member',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
