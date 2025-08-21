import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all active members with mentorship info, including the current user
    const members = await prisma.member.findMany({
      where: {
        active: true,
        OR: [
          { availableAsMentor: true },
          { seekingMentor: true }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        professionalQualification: true,
        employer: true,
        linkedin: true,
        availableAsMentor: true,
        mentorProfile: true,
        seekingMentor: true,
        menteeProfile: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Mask email addresses for privacy, except for the current user
    const maskedMembers = members.map(member => ({
      ...member,
      email: member.email === session.user.email ? member.email : maskEmail(member.email),
      isCurrentUser: member.email === session.user.email
    }))

    return NextResponse.json({ members: maskedMembers })
  } catch (error) {
    console.error("Error fetching mentorship members:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  const maskedUser =
    user.length <= 2 ? "*".repeat(user.length) : user[0] + "*".repeat(user.length - 2) + user[user.length - 1]
  const [d1, d2] = domain.split(".")
  const maskedDomain = (d1.length <= 2 ? "*".repeat(d1.length) : d1[0] + "*".repeat(d1.length - 1)) + "." + (d2 || "")
  return maskedUser + "@" + maskedDomain
}