import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

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
        active: true
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      sponsors: activeMembers,
      count: activeMembers.length
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
