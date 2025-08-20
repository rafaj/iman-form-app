import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/database"
import { requireAuth } from "@/lib/auth-utils"

const UpdateProfileSchema = z.object({
  professionalQualification: z.string().optional(),
  interest: z.string().optional(),
  contribution: z.string().optional(),
  employer: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  availableAsMentor: z.boolean().optional(),
  mentorProfile: z.string().optional(),
  seekingMentor: z.boolean().optional(),
  menteeProfile: z.string().optional(),
})

export async function GET() {
  try {
    // Check authentication
    const user = await requireAuth()

    // Find or create member record for this user
    let member = await prisma.member.findUnique({
      where: { 
        email: user.email 
      }
    })

    if (!member) {
      // If no member record exists, create one with basic info
      member = await prisma.member.create({
        data: {
          name: user.name || "",
          email: user.email,
          userId: user.id,
          active: true,
        }
      })
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        professionalQualification: member.professionalQualification,
        interest: member.interest,
        contribution: member.contribution,
        employer: member.employer,
        linkedin: member.linkedin,
        availableAsMentor: member.availableAsMentor,
        mentorProfile: member.mentorProfile,
        seekingMentor: member.seekingMentor,
        menteeProfile: member.menteeProfile,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      }
    })

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    console.error('❌ Error fetching profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = UpdateProfileSchema.parse(body)

    // Clean up linkedin URL
    let linkedinUrl: string | null = validatedData.linkedin?.trim() || null
    if (linkedinUrl === "") {
      linkedinUrl = null
    }

    // Find member record for this user
    const member = await prisma.member.findUnique({
      where: { 
        email: user.email 
      }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member profile not found" },
        { status: 404 }
      )
    }

    // Update member profile
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        professionalQualification: validatedData.professionalQualification || null,
        interest: validatedData.interest || null,
        contribution: validatedData.contribution || null,
        employer: validatedData.employer || null,
        linkedin: linkedinUrl,
        availableAsMentor: validatedData.availableAsMentor ?? false,
        mentorProfile: validatedData.mentorProfile || null,
        seekingMentor: validatedData.seekingMentor ?? false,
        menteeProfile: validatedData.menteeProfile || null,
      }
    })

    console.log(`✅ Profile updated for ${user.email}`)

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      member: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        professionalQualification: updatedMember.professionalQualification,
        interest: updatedMember.interest,
        contribution: updatedMember.contribution,
        employer: updatedMember.employer,
        linkedin: updatedMember.linkedin,
        availableAsMentor: updatedMember.availableAsMentor,
        mentorProfile: updatedMember.mentorProfile,
        seekingMentor: updatedMember.seekingMentor,
        menteeProfile: updatedMember.menteeProfile,
        updatedAt: updatedMember.updatedAt,
      }
    })

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

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

    console.error('❌ Error updating profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}