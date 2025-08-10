import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    console.log("Testing database connection...")
    
    // Test 1: Simple connection
    await prisma.$connect()
    console.log("✅ Prisma connected successfully")
    
    // Test 2: Count members
    const memberCount = await prisma.member.count()
    console.log(`✅ Member count: ${memberCount}`)
    
    // Test 3: Try to find a member
    const firstMember = await prisma.member.findFirst()
    console.log(`✅ First member found: ${firstMember?.name || 'none'}`)
    
    // Test 4: Count applications
    const appCount = await prisma.application.count()
    console.log(`✅ Application count: ${appCount}`)
    
    return NextResponse.json({ 
      success: true, 
      memberCount,
      applicationCount: appCount,
      firstMemberName: firstMember?.name || null,
      message: "All database tests passed" 
    })
  } catch (error) {
    console.error("❌ Database test failed:", error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      message: "Database test failed" 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
