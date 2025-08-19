import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().optional(),
  url: z.string().url().optional(),
  pinned: z.boolean().optional(),
  locked: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        comments: {
          where: { parentId: null }, // Only top-level comments
          orderBy: { score: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                },
                _count: {
                  select: { votes: true }
                }
              }
            },
            _count: {
              select: { 
                votes: true,
                replies: true 
              }
            }
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

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    // Only admins can pin/lock posts
    if ((validatedData.pinned !== undefined || validatedData.locked !== undefined) && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Only admins can pin or lock posts" },
        { status: 403 }
      )
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: validatedData,
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
      post: updatedPost
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating post:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete post" },
      { status: 500 }
    )
  }
}