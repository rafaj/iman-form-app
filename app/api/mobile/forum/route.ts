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

    console.log('📱 Mobile forum API accessed')

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

    // Transform posts for mobile
    const mobilePosts = posts.map(post => ({
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
      }
    }))

    console.log(`✅ Mobile forum: returning ${mobilePosts.length} posts`)

    return NextResponse.json({
      success: true,
      posts: mobilePosts,
      totalCount: mobilePosts.length,
      hasMore: mobilePosts.length === limit
    })

  } catch (error) {
    console.error('❌ Mobile forum error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch forum posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}