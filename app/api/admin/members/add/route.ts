import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/database"
import { auth } from "@/auth"

const AddMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  active: z.boolean().optional().default(true),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  professionalQualification: z.string().optional(),
  interest: z.string().optional(),
  contribution: z.string().optional(),
  employer: z.string().optional(),
  linkedin: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = AddMemberSchema.parse(body)

    // Check if member already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email }
    })

    if (existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Member with email ${validatedData.email} already exists`,
          existingMember: {
            id: existingMember.id,
            name: existingMember.name,
            email: existingMember.email,
            active: existingMember.active
          }
        },
        { status: 409 }
      )
    }

    // Create new member
    const newMember = await prisma.member.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        active: validatedData.active,
        streetAddress: validatedData.streetAddress || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zip: validatedData.zip || null,
        professionalQualification: validatedData.professionalQualification || null,
        interest: validatedData.interest || null,
        contribution: validatedData.contribution || null,
        employer: validatedData.employer || null,
        linkedin: validatedData.linkedin || null
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        event: "MEMBER_ADDED_MANUALLY",
        performedBy: session.user.email,
        metadata: {
          memberId: newMember.id,
          memberName: newMember.name,
          memberEmail: newMember.email,
          addedBy: "admin"
        }
      }
    })

    console.log(`✅ Admin added new member: ${newMember.name} (${newMember.email})`)

    return NextResponse.json({
      success: true,
      message: `Member ${newMember.name} added successfully`,
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        active: newMember.active,
        createdAt: newMember.createdAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data",
          errors: error.issues
        },
        { status: 400 }
      )
    }

    console.error('❌ Error adding member:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add member',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
