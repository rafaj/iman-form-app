"server-only"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch public user profile information from the Member table
    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: false, // Don't expose email publicly
        professionalQualification: true,
        interest: true,
        contribution: true,
        employer: true,
        linkedin: true,
        availableAsMentor: true,
        mentorProfile: true,
        seekingMentor: true,
        menteeProfile: true,
        createdAt: true,
        // Get image from user account if available
        user: {
          select: {
            image: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Transform the response to flatten the user image
    const userProfile = {
      id: member.id,
      name: member.name,
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
      image: member.user?.image
    }

    return NextResponse.json(userProfile)

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}