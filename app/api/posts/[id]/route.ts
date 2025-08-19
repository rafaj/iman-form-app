import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { checkRateLimit } from "@/lib/security"
import { z } from "zod"

const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  content: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  type: z.enum(["DISCUSSION", "ANNOUNCEMENT", "JOB_POSTING"])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const rateLimitResult = checkRateLimit(`edit-post:${session.user.id}`)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many edit requests. Please wait." },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = updatePostSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      )
    }

    const { title, content, url, type } = validation.data

    // Verify post exists and user owns it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "You can only edit your own posts" },
        { status: 403 }
      )
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content: content || null,
        url: url || null,
        type,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, image: true }
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
      message: "Post updated successfully",
      post: updatedPost
    })

  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const rateLimitResult = checkRateLimit(`delete-post:${session.user.id}`)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many delete requests. Please wait." },
        { status: 429 }
      )
    }

    // Verify post exists and user owns it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true }
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

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own posts" },
        { status: 403 }
      )
    }

    // Delete the post (cascade will handle comments and votes)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      deletedPost: {
        id: post.id,
        title: post.title,
        commentCount: post._count.comments,
        voteCount: post._count.votes
      }
    })

  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete post" },
      { status: 500 }
    )
  }
}