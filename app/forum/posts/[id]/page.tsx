"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowUp, 
  ArrowDown,
  ExternalLink,
  Pin,
  Lock,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Reply
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import MobileNavigation from "@/components/mobile-navigation"

type Comment = {
  id: string
  content: string
  score: number
  createdAt: string
  author: {
    id: string
    name: string
    image?: string
  }
  replies: Comment[]
  _count: {
    votes: number
    replies: number
  }
}

type Post = {
  id: string
  title: string
  content?: string
  url?: string
  type: "DISCUSSION" | "ANNOUNCEMENT" | "JOB_POSTING"
  pinned: boolean
  locked: boolean
  score: number
  createdAt: string
  author: {
    id: string
    name: string
    image?: string
  }
  comments: Comment[]
  _count: {
    comments: number
    votes: number
  }
}

export default function ForumPostPage() {
  const { data: session } = useSession()
  const [isMember, setIsMember] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  useEffect(() => {
    if (session?.user?.email) {
      checkMemberStatus()
    }
  }, [session])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const checkMemberStatus = async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch('/api/auth/check-admin')
      const data = await response.json()
      setIsMember(data.isMember || data.isAdmin)
    } catch (error) {
      console.error('Error checking member status:', error)
    }
  }

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forum/posts/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.post)
      } else {
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive"
        })
        router.push('/forum')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive"
      })
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setCommenting(true)
    try {
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewComment("")
        fetchPost() // Refresh to get updated comments
        toast({
          title: "Success",
          description: "Comment added successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setCommenting(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setReplyContent("")
        setReplyingTo(null)
        fetchPost() // Refresh to get updated comments
        toast({
          title: "Success",
          description: "Reply added successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add reply",
        variant: "destructive"
      })
    }
  }

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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Forum Access Required</CardTitle>
            <CardDescription>
              Please sign in to access the IMAN Professional Network forum
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Member Access Only</CardTitle>
            <CardDescription>
              The forum is available to IMAN Professional Network members only
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/apply">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Apply for Membership
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">Loading post...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Post Not Found</CardTitle>
            <CardDescription>
              The post you&apos;re looking for doesn&apos;t exist or has been removed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/forum">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Back to Forum
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                <p className="text-xs md:text-sm text-emerald-600">Community Forum</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
              <Link href="/directory" className="text-emerald-700 hover:text-emerald-900 font-medium">Directory</Link>
              <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Meetups</Link>
              <Link href="/forum" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Forum</Link>
              <Link href="/mentorship" className="text-emerald-700 hover:text-emerald-900 font-medium">Mentorship</Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-emerald-700 hover:text-emerald-900 font-medium">Admin</Link>
              )}
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
                  {session.user?.name}
                </Link>
              </div>
              <Button 
                onClick={() => signOut()}
                variant="outline" 
                size="sm" 
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Sign Out
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <MobileNavigation session={session} isProfessional={isMember} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Forum Button */}
        <div className="mb-6">
          <Link href="/forum">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Forum
            </Button>
          </Link>
        </div>

        {/* Post Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote Column */}
              <div className="flex flex-col items-center space-y-1 min-w-[40px]">
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{post.score}</span>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {post.pinned && <Pin className="w-4 h-4 text-emerald-600" />}
                  {post.locked && <Lock className="w-4 h-4 text-gray-500" />}
                  <Badge variant="secondary" className={getPostTypeColor(post.type)}>
                    {post.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                {post.url && (
                  <a 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
                  >
                    {new URL(post.url).hostname}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                {post.content && (
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <span>by {post.author.name}</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post._count.comments} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Comment Section */}
        {!post.locked && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={commenting || !newComment.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {commenting ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Comments ({post._count.comments})
          </h2>
          
          {post.comments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            post.comments.map((comment) => (
              <CommentCard 
                key={comment.id}
                comment={comment}
                postLocked={post.locked}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReply={(commentId) => setReplyingTo(commentId)}
                onCancelReply={() => setReplyingTo(null)}
                onReplyContentChange={setReplyContent}
                onSubmitReply={handleAddReply}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">IMAN Professional Network</h4>
              <p className="text-emerald-200">
                Connecting Muslim professionals in the Seattle Metro through 
                networking, professional development, and community service.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
                <li><Link href="/events" className="hover:text-white">Meetups</Link></li>
                <li><Link href="/forum" className="hover:text-white">Forum</Link></li>
                <li><Link href="/mentorship" className="hover:text-white">Mentorship</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-emerald-200">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@iman-wa.org</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>(206) 202-IMAN (4626)</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <div>
                    <div>IMAN Center</div>
                    <div>515 State St. S</div>
                    <div>Kirkland, WA 98033</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-200">
            <p>&copy; 2025 IMAN Professional Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CommentCard({ 
  comment, 
  postLocked,
  replyingTo,
  replyContent,
  onReply,
  onCancelReply,
  onReplyContentChange,
  onSubmitReply,
  formatTimeAgo 
}: { 
  comment: Comment
  postLocked: boolean
  replyingTo: string | null
  replyContent: string
  onReply: (commentId: string) => void
  onCancelReply: () => void
  onReplyContentChange: (content: string) => void
  onSubmitReply: (parentId: string) => void
  formatTimeAgo: (date: string) => string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote Column */}
          <div className="flex flex-col items-center space-y-1 min-w-[40px]">
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ArrowUp className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium">{comment.score}</span>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{comment.author.name}</span>
                <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              {!postLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </Button>
              )}
              {comment._count.replies > 0 && (
                <span className="text-gray-500">
                  {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 space-y-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Submit Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelReply}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-6 space-y-4 border-l-2 border-gray-200 pl-6">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="flex flex-col items-center space-y-1 min-w-[30px]">
                      <Button variant="ghost" size="sm" className="p-1 h-5 w-5">
                        <ArrowUp className="w-2.5 h-2.5" />
                      </Button>
                      <span className="text-xs font-medium">{reply.score}</span>
                      <Button variant="ghost" size="sm" className="p-1 h-5 w-5">
                        <ArrowDown className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}