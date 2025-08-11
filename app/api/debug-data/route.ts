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
          data: members
        },
        applications: {
          count: applications.length,
          data: applications.map(app => ({
            id: app.id,
            applicantName: app.applicantName,
            applicantEmail: app.applicantEmail,
            status: app.status,
            createdAt: app.createdAt
          }))
        }
      }
    })
  } catch (error) {
    console.error("Error fetching debug data:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
