import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const ParamsSchema = z.object({
  id: z.string().cuid()
})

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = ParamsSchema.parse(await params)

    // Check if sponsor exists and is active
    const sponsor = await prisma.sponsor.findFirst({
      where: { id, active: true }
    })

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: "Sponsor not found" },
        { status: 404 }
      )
    }

    // Check if user already hearted this sponsor
    const existingHeart = await prisma.sponsorHeart.findUnique({
      where: {
        sponsorId_userId: {
          sponsorId: id,
          userId: session.user.id
        }
      }
    })

    if (existingHeart) {
      return NextResponse.json(
        { success: false, message: "Already hearted" },
        { status: 400 }
      )
    }

    // Create heart record
    await prisma.sponsorHeart.create({
      data: {
        sponsorId: id,
        userId: session.user.id
      }
    })

    // Get updated heart count
    const heartCount = await prisma.sponsorHeart.count({
      where: { sponsorId: id }
    })

    return NextResponse.json({
      success: true,
      message: "Sponsor hearted successfully",
      heartCount
    })

  } catch (error) {
    console.error("Error hearting sponsor:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = ParamsSchema.parse(await params)

    // Check if heart exists
    const existingHeart = await prisma.sponsorHeart.findUnique({
      where: {
        sponsorId_userId: {
          sponsorId: id,
          userId: session.user.id
        }
      }
    })

    if (!existingHeart) {
      return NextResponse.json(
        { success: false, message: "Heart not found" },
        { status: 404 }
      )
    }

    // Delete heart record
    await prisma.sponsorHeart.delete({
      where: {
        sponsorId_userId: {
          sponsorId: id,
          userId: session.user.id
        }
      }
    })

    // Get updated heart count
    const heartCount = await prisma.sponsorHeart.count({
      where: { sponsorId: id }
    })

    return NextResponse.json({
      success: true,
      message: "Heart removed successfully",
      heartCount
    })

  } catch (error) {
    console.error("Error removing heart:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}