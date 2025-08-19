import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { isAdmin } from "@/lib/auth-utils"

export async function GET() {
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

    // Fetch all forum posts with author and counts
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
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

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      type: post.type,
      pinned: post.pinned,
      locked: post.locked,
      score: post.score,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name || "Unknown",
        email: post.author.email
      }
    }))

    return NextResponse.json({
      success: true,
      posts: formattedPosts
    })

  } catch (error) {
    console.error("Fetch posts error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}