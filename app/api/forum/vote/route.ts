import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const voteSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(["post", "comment"]),
  voteType: z.enum(["UP", "DOWN"])
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

    const body = await request.json()
    const validatedData = voteSchema.parse(body)

    const { targetId, targetType, voteType } = validatedData

    // Check if target exists
    if (targetType === "post") {
      const post = await prisma.post.findUnique({
        where: { id: targetId }
      })
      if (!post) {
        return NextResponse.json(
          { success: false, message: "Post not found" },
          { status: 404 }
        )
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId }
      })
      if (!comment) {
        return NextResponse.json(
          { success: false, message: "Comment not found" },
          { status: 404 }
        )
      }
    }

    // Use transaction to handle vote changes
    const result = await prisma.$transaction(async (tx) => {
      if (targetType === "post") {
        // Check for existing vote
        const existingVote = await tx.postVote.findUnique({
          where: {
            postId_userId: {
              postId: targetId,
              userId: session.user.id
            }
          }
        })

        let scoreChange = 0
        let voteCountChange = 0

        if (existingVote) {
          if (existingVote.voteType === voteType) {
            // Remove vote if clicking same vote type
            await tx.postVote.delete({
              where: { id: existingVote.id }
            })
            scoreChange = voteType === "UP" ? -1 : 1
            voteCountChange = -1
          } else {
            // Change vote type
            await tx.postVote.update({
              where: { id: existingVote.id },
              data: { voteType }
            })
            scoreChange = voteType === "UP" ? 2 : -2
          }
        } else {
          // Create new vote
          await tx.postVote.create({
            data: {
              postId: targetId,
              userId: session.user.id,
              voteType
            }
          })
          scoreChange = voteType === "UP" ? 1 : -1
          voteCountChange = 1
        }

        // Update post score and vote count
        await tx.post.update({
          where: { id: targetId },
          data: {
            score: { increment: scoreChange },
            voteCount: { increment: voteCountChange }
          }
        })

        return { scoreChange, voteCountChange }
      } else {
        // Comment voting logic (similar to post)
        const existingVote = await tx.commentVote.findUnique({
          where: {
            commentId_userId: {
              commentId: targetId,
              userId: session.user.id
            }
          }
        })

        let scoreChange = 0
        let voteCountChange = 0

        if (existingVote) {
          if (existingVote.voteType === voteType) {
            await tx.commentVote.delete({
              where: { id: existingVote.id }
            })
            scoreChange = voteType === "UP" ? -1 : 1
            voteCountChange = -1
          } else {
            await tx.commentVote.update({
              where: { id: existingVote.id },
              data: { voteType }
            })
            scoreChange = voteType === "UP" ? 2 : -2
          }
        } else {
          await tx.commentVote.create({
            data: {
              commentId: targetId,
              userId: session.user.id,
              voteType
            }
          })
          scoreChange = voteType === "UP" ? 1 : -1
          voteCountChange = 1
        }

        await tx.comment.update({
          where: { id: targetId },
          data: {
            score: { increment: scoreChange },
            voteCount: { increment: voteCountChange }
          }
        })

        return { scoreChange, voteCountChange }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
      result
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error recording vote:", error)
    return NextResponse.json(
      { success: false, message: "Failed to record vote" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const targetIds = searchParams.get("targetIds")?.split(",") || []
    const targetType = searchParams.get("targetType")

    if (!targetType || !["post", "comment"].includes(targetType)) {
      return NextResponse.json(
        { success: false, message: "Invalid target type" },
        { status: 400 }
      )
    }

    let votes: Array<{ postId?: string; commentId?: string; voteType: string }> = []

    if (targetType === "post") {
      votes = await prisma.postVote.findMany({
        where: {
          postId: { in: targetIds },
          userId: session.user.id
        },
        select: {
          postId: true,
          voteType: true
        }
      })
    } else {
      votes = await prisma.commentVote.findMany({
        where: {
          commentId: { in: targetIds },
          userId: session.user.id
        },
        select: {
          commentId: true,
          voteType: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      votes
    })
  } catch (error) {
    console.error("Error fetching votes:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch votes" },
      { status: 500 }
    )
  }
}