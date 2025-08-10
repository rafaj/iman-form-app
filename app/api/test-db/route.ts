import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    // Simple database test
    const memberCount = await prisma.member.count()
    return NextResponse.json({ 
      success: true, 
      memberCount,
      message: "Database connection successful" 
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed" 
    }, { status: 500 })
  }
}
