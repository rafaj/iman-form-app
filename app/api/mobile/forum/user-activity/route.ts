import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
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

    console.log('📱 Mobile user activity API accessed')

    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "userEmail parameter is required" },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Get user's posts
    const userPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    // Get user's comments
    const userComments = await prisma.comment.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    // Get user's total stats
    const totalPosts = await prisma.post.count({
      where: { authorId: user.id }
    })

    const totalComments = await prisma.comment.count({
      where: { authorId: user.id }
    })

    // Count upvotes on user's posts and comments separately
    const postUpvotes = await prisma.postVote.count({
      where: {
        post: { authorId: user.id },
        voteType: "UP"
      }
    })

    const commentUpvotes = await prisma.commentVote.count({
      where: {
        comment: { authorId: user.id },
        voteType: "UP"
      }
    })

    const totalLikes = postUpvotes + commentUpvotes

    // Combine posts and comments into recent activity
    const recentActivity: Array<{
      id: string
      type: string
      title: string | null
      content: string
      createdAt: string
      postId: string | null
      score: number
      commentCount: number | null
      voteCount: number
    }> = []

    // Add posts to activity
    userPosts.forEach(post => {
      recentActivity.push({
        id: post.id,
        type: "post",
        title: post.title,
        content: post.content || "",
        createdAt: post.createdAt.toISOString(),
        postId: post.id,
        score: post.score,
        commentCount: post._count.comments,
        voteCount: post._count.votes
      })
    })

    // Add comments to activity
    userComments.forEach(comment => {
      recentActivity.push({
        id: comment.id,
        type: "comment",
        title: comment.post?.title || null,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        postId: comment.postId,
        score: 0, // Comments don't have scores in this schema
        commentCount: null,
        voteCount: comment._count.votes
      })
    })

    // Sort by creation date (most recent first)
    recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Take only the most recent 15 items
    const limitedActivity = recentActivity.slice(0, 15)

    const response = {
      success: true,
      stats: {
        totalPosts,
        totalComments,
        totalLikes
      },
      recentActivity: limitedActivity
    }

    console.log(`✅ Mobile user activity: returning ${limitedActivity.length} activities for ${userEmail}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Mobile user activity error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}