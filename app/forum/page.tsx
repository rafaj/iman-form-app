"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown,
  ExternalLink,
  Pin,
  Lock,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import MobileNavigation from "@/components/mobile-navigation"

type Post = {
  id: string
  title: string
  content?: string
  url?: string
  type: "DISCUSSION" | "ANNOUNCEMENT" | "JOB_POSTING"
  pinned: boolean
  locked: boolean
  score: number
  voteCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    image?: string
  }
  _count: {
    comments: number
    votes: number
  }
}

export default function ForumPage() {
  const { data: session, status } = useSession()
  const [isMember, setIsMember] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("hot")
  const [filterType, setFilterType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.email) {
      checkMemberStatus()
    }
  }, [session])

  useEffect(() => {
    fetchPosts()
  }, [sortBy, filterType])

  const checkMemberStatus = useCallback(async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch('/api/auth/check-admin')
      const data = await response.json()
      setIsMember(data.isMember || data.isAdmin)
    } catch (error) {
      console.error('Error checking member status:', error)
    }
  }, [session])

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        sort: sortBy,
        ...(filterType !== "all" && { type: filterType })
      })
      
      const response = await fetch(`/api/forum/posts?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [sortBy, filterType, toast, setPosts, setLoading])


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
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
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">
              Community Forum
            </h1>
            <p className="mt-2 text-muted-foreground">
              Connect, share, and engage with the IMAN Professional Network community
            </p>
          </div>
          
          <CreatePostDialog 
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onPostCreated={fetchPosts}
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs value={sortBy} onValueChange={setSortBy} className="w-auto">
            <TabsList>
              <TabsTrigger value="hot" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Hot
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="DISCUSSION">Discussions</SelectItem>
              <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
              <SelectItem value="JOB_POSTING">Job Postings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-muted-foreground mb-4">No posts found</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} session={session} onPostUpdated={fetchPosts} />
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
                    <div>515 State St.</div>
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

function PostCard({ post, session, onPostUpdated }: { 
  post: Post
  session: Session | null
  onPostUpdated: () => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editContent, setEditContent] = useState(post.content || "")
  const [editUrl, setEditUrl] = useState(post.url || "")
  const [editType, setEditType] = useState(post.type)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const canEditDelete = session?.user?.id === post.author.id

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully."
        })
        onPostUpdated()
      } else {
        toast({
          title: "Delete failed",
          description: data.message || "Failed to delete post.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Delete post error:', error)
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the post.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          url: editUrl,
          type: editType
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Post updated",
          description: "Your post has been updated successfully."
        })
        setIsEditing(false)
        onPostUpdated()
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Failed to update post.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Update post error:', error)
      toast({
        title: "Update failed",
        description: "An error occurred while updating the post.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.pinned && <Pin className="w-4 h-4 text-emerald-600" />}
                    {post.locked && <Lock className="w-4 h-4 text-gray-500" />}
                    <Badge variant="secondary" className={getPostTypeColor(post.type)}>
                      {post.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {/* Edit/Delete Menu for Post Owner */}
                {canEditDelete && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)} disabled={loading}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Link href={`/forum/posts/${post.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-700 transition-colors">
                  {post.title}
                </h3>
              </Link>
              
              {post.url && (
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  {new URL(post.url).hostname}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              
              {post.content && (
                <p className="text-gray-600 mt-2 line-clamp-3">
                  {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>by {post.author.name}</span>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link 
                    href={`/forum/posts/${post.id}`}
                    className="flex items-center gap-1 hover:text-emerald-600"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {post.commentCount} comments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Post Type</Label>
              <Select value={editType} onValueChange={(value) => setEditType(value as "DISCUSSION" | "ANNOUNCEMENT" | "JOB_POSTING")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCUSSION">Discussion</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="JOB_POSTING">Job Posting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">URL (optional)</Label>
              <Input
                id="edit-url"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content (optional)</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Updating..." : "Update Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CreatePostDialog({ 
  isOpen, 
  onOpenChange, 
  onPostCreated 
}: { 
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: () => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [type, setType] = useState("DISCUSSION")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || undefined,
          url: url.trim() || undefined,
          type
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Post created successfully"
        })
        onPostCreated()
        onOpenChange(false)
        setTitle("")
        setContent("")
        setUrl("")
        setType("DISCUSSION")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share a discussion, announcement, or job posting with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Post Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCUSSION">Discussion</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                <SelectItem value="JOB_POSTING">Job Posting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, provide details, or start a discussion..."
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}