import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    const members = await prisma.member.findMany()
    const applications = await prisma.application.findMany()
    
    return NextResponse.json({
      success: true,
      data: {
        members: {
          count: members.length,
          sample: members.slice(0, 2).map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            active: m.active
          }))
        },
        applications: {
          count: applications.length,
          sample: applications.slice(0, 2).map(a => ({
            id: a.id,
            applicantName: a.applicantName,
            status: a.status
          }))
        }
      }
    })
  } catch (error) {
    console.error("Error checking data:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
