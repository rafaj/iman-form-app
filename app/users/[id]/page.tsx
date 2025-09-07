"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  ArrowLeft, 
  MessageSquare,
  FileText
} from "lucide-react"
import Link from "next/link"

type Post = {
  id: string
  title: string
  content?: string
  url?: string
  type: string
  createdAt: string
  _count: {
    comments: number
    votes: number
  }
}

type Comment = {
  id: string
  content: string
  createdAt: string
  post: {
    id: string
    title: string
  }
}

type UserActivity = {
  id: string
  name: string
  posts: Post[]
  comments: Comment[]
}

export default function UserActivityPage() {
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const userId = params.id as string

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT": return "bg-blue-100 text-blue-800"
      case "JOB_POSTING": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/activity`)
        if (response.ok) {
          const data = await response.json()
          setUserActivity(data)
        } else {
          console.error('Failed to fetch user activity')
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserActivity()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!userActivity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/forum" className="text-emerald-600 hover:text-emerald-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">User not found or no activity available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/forum" className="text-emerald-600 hover:text-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Activity for {userActivity.name}</h1>
        </div>

        <div className="space-y-6">
          {/* Posts Section */}
          {userActivity.posts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Posts ({userActivity.posts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.posts.map((post) => (
                    <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getPostTypeColor(post.type)}>
                          {post.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      
                      <Link href={`/forum/posts/${post.id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-emerald-700 transition-colors mb-1">
                          {post.title}
                        </h3>
                      </Link>
                      
                      {post.content && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <Link 
                          href={`/forum/posts/${post.id}`}
                          className="flex items-center space-x-1 hover:text-emerald-600"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{post._count.comments} comments</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          {userActivity.comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({userActivity.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">commented on</span>
                        <Link 
                          href={`/forum/posts/${comment.post.id}`}
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          {comment.post.title}
                        </Link>
                      </div>
                      
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {comment.content.length > 200 ? `${comment.content.substring(0, 200)}...` : comment.content}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Activity */}
          {userActivity.posts.length === 0 && userActivity.comments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No forum activity found for this user.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}