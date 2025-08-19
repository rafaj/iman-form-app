import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST() {
  try {
    // Find the existing member
    const member = await prisma.member.findFirst({
      where: { active: true }
    })

    if (!member) {
      return NextResponse.json({ 
        success: false, 
        message: "No active members found" 
      })
    }

    // Add professional information
    await prisma.member.update({
      where: { id: member.id },
      data: {
        professionalQualification: "Senior Software Engineer with 8+ years experience in full-stack development, specializing in React, Node.js, and cloud architecture.",
        interest: "Mentoring junior developers, Islamic fintech solutions, and building scalable web applications for community organizations.",
        contribution: "I can help IMAN by providing technical mentorship to members, building web solutions for community initiatives, and sharing knowledge about modern software development practices.",
        employer: "Microsoft",
        linkedin: "https://linkedin.com/in/syedamirhusain"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added professional information to ${member.name}`,
      member: {
        name: member.name,
        email: member.email
      }
    })
    
  } catch (error) {
    console.error('Error adding test data:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add test data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}