"server-only"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch user's posts
    const posts = await prisma.post.findMany({
      where: { 
        authorId: id
      },
      select: {
        id: true,
        title: true,
        content: true,
        url: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to most recent 10 posts
    })

    // Fetch user's comments
    const comments = await prisma.comment.findMany({
      where: { 
        authorId: id
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to most recent 20 comments
    })

    // Get user's name from either User or Member table
    let userName = 'Unknown User'
    
    // Try to get from User table first
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true }
    })

    if (user?.name) {
      userName = user.name
    } else {
      // Try Member table if not found in User
      const member = await prisma.member.findUnique({
        where: { id },
        select: { name: true }
      })
      if (member?.name) {
        userName = member.name
      }
    }

    const userActivity = {
      id,
      name: userName,
      posts,
      comments
    }

    return NextResponse.json(userActivity)

  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}