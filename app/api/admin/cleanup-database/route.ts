import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { validateAdminRequest } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('🧹 Starting database cleanup...')
    
    // Find the member to keep
    const keepMember = await prisma.member.findUnique({
      where: { email: 'jafar@jafar.com' }
    })
    
    if (!keepMember) {
      console.log('❌ Member jafar@jafar.com not found in database')
      const allMembers = await prisma.member.findMany({
        select: { email: true, name: true }
      })
      
      return NextResponse.json({
        success: false,
        message: 'Member jafar@jafar.com not found',
        availableMembers: allMembers
      }, { status: 404 })
    }
    
    console.log(`✅ Found member to keep: ${keepMember.name} (${keepMember.email})`)
    
    // Get count of members to delete
    const membersToDelete = await prisma.member.count({
      where: {
        email: {
          not: 'jafar@jafar.com'
        }
      }
    })
    
    console.log(`📊 Members to delete: ${membersToDelete}`)
    
    if (membersToDelete === 0) {
      return NextResponse.json({
        success: true,
        message: 'No members to delete. Database is already clean.',
        deletedApplications: 0,
        deletedMembers: 0,
        remainingMembers: [keepMember]
      })
    }
    
    // Delete all applications first (due to foreign key constraints)
    console.log('🗑️  Deleting all applications...')
    const deletedApplications = await prisma.application.deleteMany({})
    console.log(`✅ Deleted ${deletedApplications.count} applications`)
    
    // Delete all members except jafar@jafar.com
    console.log('🗑️  Deleting other members...')
    const deletedMembers = await prisma.member.deleteMany({
      where: {
        email: {
          not: 'jafar@jafar.com'
        }
      }
    })
    console.log(`✅ Deleted ${deletedMembers.count} members`)
    
    // Verify final state
    const remainingMembers = await prisma.member.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    })
    
    console.log('🎉 Database cleanup completed!')
    
    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed successfully',
      deletedApplications: deletedApplications.count,
      deletedMembers: deletedMembers.count,
      remainingMembers
    })
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database cleanup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
