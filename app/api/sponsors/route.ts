import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    // Fetch active sponsors with heart counts and user's heart status
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        logoUrl: true,
        tier: true,
        createdAt: true,
        _count: {
          select: {
            hearts: true
          }
        },
        hearts: {
          select: {
            userId: true,
            user: {
              select: {
                name: true
              }
            }
          },
          take: 10 // Limit to 10 names for tooltip
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the response to include heart status
    const sponsorsWithHearts = sponsors.map(sponsor => {
      const heartedByNames = sponsor.hearts.map((heart: { user: { name: string | null } }) => heart.user.name).filter(Boolean)
      const isHearted = userId ? sponsor.hearts.some((heart: { userId: string }) => heart.userId === userId) : false
      
      return {
        id: sponsor.id,
        name: sponsor.name,
        description: sponsor.description,
        website: sponsor.website || '#',
        logo: sponsor.logoUrl || '/globe.svg',
        heartCount: sponsor._count.hearts,
        isHearted,
        heartedByNames,
        createdAt: sponsor.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      sponsors: sponsorsWithHearts
    })

  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}