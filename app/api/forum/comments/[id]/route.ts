import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000)
})

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
    const validatedData = updateCommentSchema.parse(body)

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { post: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    const isAuthor = existingComment.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    // Check if post is locked
    if (existingComment.post.locked && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Cannot edit comment on locked post" },
        { status: 403 }
      )
    }

    const updatedComment = await prisma.comment.update({
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
            votes: true,
            replies: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment: updatedComment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating comment:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update comment" },
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

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { 
        post: true,
        _count: { select: { replies: true } }
      }
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    const isAuthor = existingComment.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    // If comment has replies, just mark as deleted instead of removing
    if (existingComment._count.replies > 0) {
      await prisma.comment.update({
        where: { id },
        data: {
          content: "[deleted]"
        }
      })
    } else {
      await prisma.comment.delete({
        where: { id }
      })

      // Update post comment count
      await prisma.post.update({
        where: { id: existingComment.postId },
        data: {
          commentCount: {
            decrement: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 }
    )
  }
}