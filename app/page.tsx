import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, ArrowRight, Mail, Phone, MapPin, Calendar, MessageSquare, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/database"
import { getUpcomingEvents } from "@/lib/eventbrite"
import { getCached, setCached, CACHE_KEYS } from "@/lib/cache"
import MobileNavigation from "@/components/mobile-navigation"
import WelcomeProfessionals from "@/components/welcome-professionals"
import CommunitySpotlight from "@/components/community-spotlight"

function ForumPostPreview({ post }: { 
  post: {
    id: string
    title: string
    content?: string | null
    url?: string | null
    type: string
    createdAt: string
    author: {
      id: string
      name: string | null
      image?: string | null
    }
    _count: {
      comments: number
      votes: number
    }
  }
}) {
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
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={`${getPostTypeColor(post.type)} text-xs px-2 py-1`}>
          {post.type.replace('_', ' ')}
        </Badge>
        
        <Link href={`/forum/posts/${post.id}`} className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 hover:text-emerald-700 transition-colors truncate">
            {post.title}
          </h4>
        </Link>
        
        {post.url && (
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0"
            title={post.url}
          >
            {new URL(post.url).hostname}
            <ArrowRight className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
      
      <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
        <span>by {post.author.name || 'Unknown'}</span>
        <span>{formatTimeAgo(post.createdAt)}</span>
        <Link 
          href={`/forum/posts/${post.id}`}
          className="flex items-center space-x-1 hover:text-emerald-600"
        >
          <MessageSquare className="w-2.5 h-2.5" />
          <span>{post._count.comments}</span>
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const session = await auth()
  
  // Check if user is an actual member (has completed activation)
  let isMember = false
  if (session?.user?.id) {
    try {
      // Allow admin users to see member content in development
      if (session.user?.email === process.env.ADMIN_EMAIL) {
        isMember = true
      } else {
        // Check cache first for member status (1 minute cache)
        const cacheKey = CACHE_KEYS.MEMBER_CHECK(session.user?.email || '')
        let member = getCached<{ id: string; userId?: string | null; email: string; active: boolean } | null>(cacheKey)
        
        if (member === null) {
          // Single optimized query with OR condition instead of sequential queries
          member = await prisma.member.findFirst({
            where: {
              OR: [
                { userId: session.user?.id || '' },
                { 
                  email: session.user?.email || '',
                  active: true 
                }
              ]
            }
          })
          
          // Cache for 1 minute (short cache for auth-critical data)
          setCached(cacheKey, member, 1)
        }
        
        isMember = !!member
      }
    } catch (error) {
      console.error("Error checking member status:", error)
      // Fallback for admin in case of database issues
      if (session.user?.email === process.env.ADMIN_EMAIL) {
        isMember = true
      }
    }
  }

  const events = await getUpcomingEvents(3)

  // Fetch recent new members for welcome section
  let newMembers: Array<{
    id: string
    name: string
    displayName: string
    image: string | null
    employer: string | null
    professionalQualification: string | null
    interest: string | null
    contribution: string | null
    linkedin: string | null
    createdAt: string
    initials: string
  }> = []
  
  if (isMember) {
    try {
      // Check cache first (10 minute cache for members)  
      type MemberWithUser = {
        id: string
        name: string
        employer: string | null
        professionalQualification: string | null
        interest: string | null
        contribution: string | null
        linkedin: string | null
        createdAt: Date
        user: { name: string | null; image: string | null } | null
      }
      let recentMembers = getCached<MemberWithUser[]>(CACHE_KEYS.RECENT_MEMBERS)
      
      if (!recentMembers) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        recentMembers = await prisma.member.findMany({
          where: {
            active: true,
            createdAt: { gte: thirtyDaysAgo }
          },
          select: {
            id: true,
            name: true,
            employer: true,
            professionalQualification: true,
            interest: true,
            contribution: true,
            linkedin: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20 // Get more than 6 to handle the counter
        })
        
        // Cache for 10 minutes
        setCached(CACHE_KEYS.RECENT_MEMBERS, recentMembers, 10)
      }
      
      // Only show if we have at least 3 new members
      if (recentMembers.length >= 3) {
        newMembers = recentMembers.map(member => {
          const displayName = member.user?.name || member.name
          return {
            id: member.id,
            name: member.name,
            displayName,
            image: member.user?.image || null,
            employer: member.employer,
            professionalQualification: member.professionalQualification,
            interest: member.interest,
            contribution: member.contribution,
            linkedin: member.linkedin,
            createdAt: member.createdAt.toISOString(),
            initials: displayName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          }
        })
      }
    } catch (error) {
      console.error("Error fetching new members:", error)
      newMembers = []
    }
  }

  // Fetch recent forum posts for members
  let recentPosts: Array<{
    id: string
    title: string
    content?: string | null
    url?: string | null
    type: string
    createdAt: string
    author: {
      id: string
      name: string | null
      image?: string | null
    }
    _count: {
      comments: number
      votes: number
    }
  }> = []
  
  if (isMember) {
    try {
      // Check cache first (3 minute cache for forum posts)
      type PostWithAuthor = {
        id: string
        title: string
        content: string | null
        url: string | null  
        type: string
        createdAt: Date
        author: { id: string; name: string | null; image: string | null }
        _count: { comments: number; votes: number }
      }
      let posts = getCached<PostWithAuthor[]>(CACHE_KEYS.FORUM_POSTS)
      
      if (!posts) {
        // Only fetch posts if user is actually a member
        posts = await prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          take: 3,
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
        
        // Cache for 3 minutes (shorter for more dynamic content)
        setCached(CACHE_KEYS.FORUM_POSTS, posts, 3)
      }
      
      recentPosts = posts.map(post => ({
        ...post,
        type: post.type as string,
        createdAt: post.createdAt.toISOString()
      }))
    } catch (error) {
      console.error("Error fetching recent forum posts:", error)
      // Still set empty array so page doesn't break
      recentPosts = []
    }
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
                <p className="text-xs md:text-sm text-emerald-600">
                  {isMember && session ? `Welcome back, ${session.user?.name}!` : "Connecting Professionals in the Seattle Metro"}
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isMember && (
                    <>
                      <Link href="/directory" className="text-emerald-700 hover:text-emerald-900 font-medium">Directory</Link>
                      <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Meetups</Link>
                      <Link href="/forum" className="text-emerald-700 hover:text-emerald-900 font-medium">Forum</Link>
                      <Link href="/mentorship" className="text-emerald-700 hover:text-emerald-900 font-medium">Mentorship</Link>
                    </>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-emerald-700 hover:text-emerald-900 font-medium">Admin</Link>
                  )}
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
                      {session.user?.name}
                    </Link>
                  </div>
                  <form action={async () => { "use server"; await signOut() }}>
                    <Button type="submit" variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <a href="#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</a>
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Sign In
                  </Link>
                  <Link href="/apply">
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Join IMAN Professional Network
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <MobileNavigation session={session} isProfessional={isMember} />
          </div>
        </div>
      </header>

      {/* Hero Section - For non-members (including non-logged-in users) */}
      {!isMember && (
        <section className="relative py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-emerald-900 mb-6">
                IMAN Professional Network
              </h1>
              <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-4xl mx-auto">
                Connecting Muslim professionals in the Seattle Metro through meaningful 
                relationships, career growth, and community impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg">
                    <Users className="h-6 w-6 mr-2" />
                    Join Our Network
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg">
                    Professional Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Mission Section - Only show for non-members */}
      {!isMember && (
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-xl font-bold text-emerald-800 mb-6">Our Mission</h2>
                <p className="text-emerald-700 mb-6 text-lg">
                  The IMAN Professional Network is a vibrant community of Muslim professionals 
                  in the Seattle Metro, dedicated to fostering career growth, meaningful 
                  connections, and positive impact in our communities.
                </p>
                <p className="text-emerald-700 mb-6">
                  Through networking meetups, professional development workshops, and community 
                  service initiatives, we empower our members to excel in their careers while 
                  staying true to their values and faith.
                </p>
                <Link href="/apply">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Learn More About Professional Membership
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="bg-emerald-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-emerald-900 mb-6">What We Offer</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Weekly networking meetups and mixers</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Professional development workshops</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Community service opportunities</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Mentorship and career guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section - Only show for non-members */}
      {!isMember && (
        <section className="py-20 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold text-emerald-800 mb-4">Our Values</h2>
              <p className="text-emerald-700 max-w-2xl mx-auto">
                We believe in building a community that reflects our shared values and commitments.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Community</h3>
                <p className="text-emerald-700">
                  Building lasting relationships and supporting one another&apos;s success through shared experiences and mutual growth.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Excellence</h3>
                <p className="text-emerald-700">
                  Striving for professional excellence while maintaining our Islamic values and ethical principles in all endeavors.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Impact</h3>
                <p className="text-emerald-700">
                  Making a positive difference in our local community and beyond through service and professional contribution.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Community Spotlight Section - Only show for members */}
      {isMember && <CommunitySpotlight />}

      {/* Events Section - Only show for members */}
      {isMember && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Upcoming Meetups</h3>
              <p className="text-emerald-700 mb-4">Join us for weekly networking and professional development</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              {events.map((event) => (
                <div key={event.id} className="bg-emerald-50 rounded-lg p-6 border border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{event.title}</h4>
                      <div className="space-y-1 text-sm text-emerald-700">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="ml-6">{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4">{event.description}</p>
                  <a 
                    href={event.registrationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Learn More
                    </Button>
                  </a>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/events">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Calendar className="h-5 w-5 mr-2" />
                  View All Meetups
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Forum Posts Section - Only show for members */}
      {isMember && recentPosts.length > 0 && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Latest Forum Discussions</h3>
              <p className="text-emerald-700">
                Stay connected with the latest conversations in our community forum.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {recentPosts.map((post) => (
                <ForumPostPreview key={post.id} post={post} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/forum">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  View All Forum Posts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Welcome New Professionals Section - Only show for members */}
      {isMember && <WelcomeProfessionals newMembers={newMembers} />}

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-12">
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
                {session && isMember && (
                  <>
                    <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
                    <li><Link href="/events" className="hover:text-white">Meetups</Link></li>
                    <li><Link href="/forum" className="hover:text-white">Forum</Link></li>
                    <li><Link href="/mentorship" className="hover:text-white">Mentorship</Link></li>
                  </>
                )}
                {!session && (
                  <>
                    <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
                    <li><Link href="/auth/signin" className="hover:text-white">Professional Sign In</Link></li>
                  </>
                )}
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

      {/* Floating Donation Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=BFGJ7UTSLBT8A"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        >
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-sm font-medium">Donate</span>
        </a>
      </div>
    </div>
  )
}
