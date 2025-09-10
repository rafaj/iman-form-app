import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  postId: z.string(),
  parentId: z.string().optional(),
  userEmail: z.string().email() // For mobile, we'll identify users by email
})

export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication for mobile
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MOBILE_API_KEY || 'iman-mobile-2024'
    
    if (!authHeader || !authHeader.includes(expectedKey)) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 }
      )
    }

    console.log('📱 Mobile comment creation API accessed')

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // Find user by email (since mobile doesn't have full auth session)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please ensure you're signed in." },
        { status: 404 }
      )
    }

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
      return NextResponse.json(
        { success: false, message: "Post is locked for comments" },
        { status: 403 }
      )
    }

    // If parentId is provided, verify parent comment exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: "Parent comment not found" },
          { status: 404 }
        )
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId: validatedData.postId,
        parentId: validatedData.parentId,
        authorId: user.id
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
          select: { votes: true }
        }
      }
    })

    // Transform for mobile response
    const mobileComment = {
      id: comment.id,
      content: comment.content,
      score: comment.score,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        image: comment.author.image
      },
      voteCount: comment._count.votes,
      replyCount: 0, // New comment has no replies
      replies: []
    }

    console.log(`✅ Mobile comment created for post ${validatedData.postId}`)

    return NextResponse.json({
      success: true,
      comment: mobileComment
    })

  } catch (error) {
    console.error('❌ Mobile comment creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid comment data',
          errors: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}