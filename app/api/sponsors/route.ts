import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
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
        hearts: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the response to include heart status
    const sponsorsWithHearts = sponsors.map(sponsor => ({
      id: sponsor.id,
      name: sponsor.name,
      description: sponsor.description,
      website: sponsor.website || '#',
      logo: sponsor.logoUrl || '/globe.svg',
      heartCount: sponsor._count.hearts,
      isHearted: userId ? sponsor.hearts.length > 0 : false
    }))

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