import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/database"
import { validateAdminRequest } from "@/lib/admin-auth"

const EditMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  active: z.boolean().optional().default(true),
  // Professional fields only - address fields hidden for privacy
  professionalQualification: z.string().max(500).optional(),
  interest: z.string().max(1000).optional(),
  contribution: z.string().max(1000).optional(),
  employer: z.string().max(200).optional(),
  linkedin: z.string().url().max(300).optional().or(z.literal(""))
})

export async function GET(
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

    // Get member details - single source of truth
    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        // Professional data from member table (always current)
        professionalQualification: true,
        interest: true,
        contribution: true,
        employer: true,
        linkedin: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member: {
        ...member,
        // Professional data comes directly from member table
        professionalQualification: member.professionalQualification || "",
        interest: member.interest || "",
        contribution: member.contribution || "",
        employer: member.employer || "",
        linkedin: member.linkedin || ""
      }
    })

  } catch (error) {
    console.error('❌ Error fetching member for edit:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch member details',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const validatedData = EditMemberSchema.parse(body)

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      )
    }

    // Check if email is being changed and if new email already exists
    if (validatedData.email !== existingMember.email) {
      const emailExists = await prisma.member.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already exists for another member" },
          { status: 409 }
        )
      }
    }

    // Update member - single source of truth for all editable data
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        active: validatedData.active,
        // Professional data updated directly in member table
        professionalQualification: validatedData.professionalQualification || "",
        interest: validatedData.interest || "",
        contribution: validatedData.contribution || "",
        employer: validatedData.employer || "",
        linkedin: validatedData.linkedin || ""
      }
    })

    console.log(`✅ Admin updated member: ${updatedMember.name} (${updatedMember.email})`)

    return NextResponse.json({
      success: true,
      message: `Member ${updatedMember.name} updated successfully`,
      member: updatedMember
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

    console.error('❌ Error updating member:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update member',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
