import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { isAdmin } from "@/lib/auth-utils"
import { checkRateLimit } from "@/lib/security"

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      )
    }

    const rateLimitResult = checkRateLimit(`admin-action:${session.user.email}`)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many admin actions. Please wait." },
        { status: 429 }
      )
    }

    const postId = context.params.id

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { name: true, email: true }
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

    // Delete the post (cascade will handle comments and votes)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      success: true,
      message: `Post "${post.title}" deleted successfully`,
      deletedPost: {
        id: post.id,
        title: post.title,
        author: post.author.name,
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