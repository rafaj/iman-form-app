import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const ConnectSchema = z.object({
  targetMemberId: z.string().min(1),
  type: z.enum(['mentor', 'mentee']),
  message: z.string().max(500).optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const body = ConnectSchema.parse(json)

    // Find the current user's member record
    const currentMember = await prisma.member.findUnique({
      where: { email: session.user.email }
    })

    if (!currentMember) {
      return NextResponse.json({ message: "Member record not found" }, { status: 404 })
    }

    // Find the target member
    const targetMember = await prisma.member.findUnique({
      where: { id: body.targetMemberId }
    })

    if (!targetMember || !targetMember.active) {
      return NextResponse.json({ message: "Target member not found or inactive" }, { status: 404 })
    }

    // Prevent self-connection
    if (currentMember.id === targetMember.id) {
      return NextResponse.json({ message: "Cannot connect to yourself" }, { status: 400 })
    }

    // Determine mentor/mentee relationship based on request type
    const mentorId = body.type === 'mentor' ? targetMember.id : currentMember.id
    const menteeId = body.type === 'mentor' ? currentMember.id : targetMember.id

    // Check if connection already exists
    const existingConnection = await prisma.mentorshipRequest.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId,
          menteeId
        }
      }
    })

    if (existingConnection) {
      return NextResponse.json({ 
        message: "Connection request already exists between you and this member" 
      }, { status: 409 })
    }

    // Create the connection request
    await prisma.mentorshipRequest.create({
      data: {
        mentorId,
        menteeId,
        message: body.message || '',
        requestType: body.type === 'mentor' ? 'General mentorship request' : 'Mentee connection request',
        status: 'PENDING'
      }
    })

    // TODO: Send email notification to target member
    console.log(`Mentorship connection request created: ${currentMember.name} -> ${targetMember.name} (${body.type})`)

    return NextResponse.json({ 
      message: "Connection request sent successfully" 
    })
  } catch (error) {
    console.error("Error creating mentorship connection:", error)
    
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 })
    }
    
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}