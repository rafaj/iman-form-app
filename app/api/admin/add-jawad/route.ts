import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { validateAdminRequest } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const memberData = {
      name: "Jawad Khaki",
      email: "jawad_khaki@iman-wa.org"
    }

    // Check if member already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: memberData.email }
    })

    if (existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Jawad Khaki already exists in the database`,
          existingMember: {
            id: existingMember.id,
            name: existingMember.name,
            email: existingMember.email,
            active: existingMember.active,
            createdAt: existingMember.createdAt
          }
        },
        { status: 409 }
      )
    }

    // Create Jawad Khaki as a member
    const newMember = await prisma.member.create({
      data: {
        name: memberData.name,
        email: memberData.email,
        active: true
      }
    })

    console.log(`✅ Admin added Jawad Khaki: ${newMember.name} (${newMember.email})`)

    return NextResponse.json({
      success: true,
      message: `Jawad Khaki added successfully to the production database`,
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        active: newMember.active,
        createdAt: newMember.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Error adding Jawad Khaki:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add Jawad Khaki to database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
