import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const createPostSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().optional(),
  url: z.string().url().optional(),
  type: z.enum(["DISCUSSION", "ANNOUNCEMENT", "JOB_POSTING", "EVENT"]).default("DISCUSSION")
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const type = searchParams.get("type")
    const sort = searchParams.get("sort") || "hot"
    
    const skip = (page - 1) * limit

    let orderBy: Record<string, string> = {}
    switch (sort) {
      case "new":
        orderBy = { createdAt: "desc" }
        break
      case "top":
        orderBy = { score: "desc" }
        break
      case "hot":
      default:
        // Hot algorithm: score / (hours since creation + 2)^1.8
        orderBy = { score: "desc" }
        break
    }

    const where = type ? { type: type as "DISCUSSION" | "ANNOUNCEMENT" | "JOB_POSTING" | "EVENT" } : {}

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Check if user is a member for certain post types
    if (validatedData.type === "ANNOUNCEMENT") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (user?.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Only admins can create announcements" },
          { status: 403 }
        )
      }
    }

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating post:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create post" },
      { status: 500 }
    )
  }
}