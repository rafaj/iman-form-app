import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  postId: z.string(),
  parentId: z.string().optional()
})

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
    const validatedData = createCommentSchema.parse(body)

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      )
    }

    // Check if post is locked
    if (post.locked) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (user?.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Post is locked" },
          { status: 403 }
        )
      }
    }

    let depth = 0
    let parentComment = null

    // If replying to a comment, verify it exists and calculate depth
    if (validatedData.parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: "Parent comment not found" },
          { status: 404 }
        )
      }

      if (parentComment.postId !== validatedData.postId) {
        return NextResponse.json(
          { success: false, message: "Parent comment does not belong to this post" },
          { status: 400 }
        )
      }

      depth = parentComment.depth + 1
      
      // Limit nesting depth
      if (depth > 10) {
        return NextResponse.json(
          { success: false, message: "Maximum nesting depth reached" },
          { status: 400 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId: validatedData.postId,
        authorId: session.user.id,
        parentId: validatedData.parentId,
        depth
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
            votes: true,
            replies: true
          }
        }
      }
    })

    // Update post comment count
    await prisma.post.update({
      where: { id: validatedData.postId },
      data: {
        commentCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating comment:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create comment" },
      { status: 500 }
    )
  }
}