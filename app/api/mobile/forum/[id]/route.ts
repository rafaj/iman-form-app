import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

    console.log(`📱 Mobile forum post API accessed for post ${id}`)

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

    // Transform for mobile consumption
    const mobilePost = {
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      type: post.type,
      pinned: post.pinned,
      locked: post.locked,
      score: post.score,
      commentCount: post._count.comments,
      voteCount: post._count.votes,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name,
        image: post.author.image
      },
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        score: comment.score,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image
        },
        replyCount: comment._count.replies,
        voteCount: comment._count.votes,
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          score: reply.score,
          createdAt: reply.createdAt.toISOString(),
          author: {
            id: reply.author.id,
            name: reply.author.name,
            image: reply.author.image
          },
          voteCount: reply._count.votes
        }))
      }))
    }

    console.log(`✅ Mobile forum post: returning post with ${mobilePost.comments.length} comments`)

    return NextResponse.json({
      success: true,
      post: mobilePost
    })

  } catch (error) {
    console.error('❌ Mobile forum post error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch post details',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}