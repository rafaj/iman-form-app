"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

import Link from "next/link"
import { Search, Users, UserCheck, Mail, Phone, MapPin } from "lucide-react" 
import MobileNavigation from "@/components/mobile-navigation"

interface Member {
  id: string
  name: string
  email: string
  professionalQualification?: string
  employer?: string
  linkedin?: string
  availableAsMentor: boolean
  mentorProfile?: string
  seekingMentor: boolean
  menteeProfile?: string
  isCurrentUser?: boolean
}

export default function MentorshipPage() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMember, setIsMember] = useState(false)
  

  useEffect(() => {
    if (session?.user) {
      checkMemberStatus()
      fetchMembers()
    }
  }, [session])

  const checkMemberStatus = async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch('/api/auth/check-admin')
      const data = await response.json()
      setIsMember(data.isMember || data.isAdmin)
    } catch (err) {
      console.error('Error checking member status:', err)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/mentorship/browse')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error('Error fetching members:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMentors = members.filter(member => 
    member.availableAsMentor && 
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.mentorProfile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.professionalQualification?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredMentees = members.filter(member => 
    member.seekingMentor &&
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.menteeProfile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.professionalQualification?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading mentorship opportunities...</p>
        </div>
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
                <p className="text-xs md:text-sm text-emerald-600">Professional Mentorship</p>
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
                      <Link href="/mentorship" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Mentorship</Link>
                    </>
                  )}
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
                </>
              ) : (
                <>
                  <Link href="/#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</Link>
                  <Link href="/apply" className="text-emerald-700 hover:text-emerald-900 font-medium">Apply</Link>
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Member Sign In
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <MobileNavigation session={session} isProfessional={isMember} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-xl font-bold text-emerald-800">Professional Mentorship</h1>
          <p className="mt-2 text-muted-foreground">
            Connect with mentors and mentees in our community for professional growth and development.
          </p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
            <Input
              placeholder="Search by name, skills, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mentors" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Find Mentors ({filteredMentors.length})
            </TabsTrigger>
            <TabsTrigger value="mentees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Find Mentees ({filteredMentees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="border-emerald-100">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">
                        {mentor.name}
                        {mentor.isCurrentUser && (
                          <span className="text-sm font-normal text-emerald-600 ml-2">(You)</span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        {mentor.isCurrentUser && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            Your Profile
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          Mentor
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {mentor.professionalQualification}
                      {mentor.employer && ` • ${mentor.employer}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mentor.mentorProfile && (
                      <div>
                        <h4 className="font-medium text-sm text-emerald-900 mb-1">Can mentor in:</h4>
                        <p className="text-sm text-muted-foreground">{mentor.mentorProfile}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {mentor.isCurrentUser ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                          className="border-emerald-300 text-emerald-700"
                        >
                          <Link href="/profile">
                            Edit Profile
                          </Link>
                        </Button>
                      ) : (
                        mentor.linkedin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                            className="border-emerald-300"
                          >
                            <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-emerald-900 mb-2">No mentors found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms." : "No members are currently available as mentors."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mentees" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentees.map((mentee) => (
                <Card key={mentee.id} className="border-emerald-100">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">
                        {mentee.name}
                        {mentee.isCurrentUser && (
                          <span className="text-sm font-normal text-emerald-600 ml-2">(You)</span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        {mentee.isCurrentUser && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            Your Profile
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Seeking Mentor
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {mentee.professionalQualification}
                      {mentee.employer && ` • ${mentee.employer}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mentee.menteeProfile && (
                      <div>
                        <h4 className="font-medium text-sm text-emerald-900 mb-1">Seeking guidance on:</h4>
                        <p className="text-sm text-muted-foreground">{mentee.menteeProfile}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {mentee.isCurrentUser ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                          className="border-emerald-300 text-emerald-700"
                        >
                          <Link href="/profile">
                            Edit Profile
                          </Link>
                        </Button>
                      ) : (
                        mentee.linkedin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                            className="border-emerald-300"
                          >
                            <a href={mentee.linkedin} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredMentees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-emerald-900 mb-2">No mentees found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms." : "No members are currently seeking mentorship."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

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
                    <li><Link href="/auth/signin" className="hover:text-white">Member Sign In</Link></li>
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
    </div>
  )
}