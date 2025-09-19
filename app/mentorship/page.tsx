"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Clock, CheckCircle, XCircle, User, Calendar, ArrowLeft, Star, Users, Linkedin, Building2, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import MobileNavigation from "@/components/mobile-navigation"

type MentorshipRequest = {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  message: string
  requestType: string
  preferredFormat: string | null
  mentorResponse: string | null
  contactShared: boolean
  createdAt: string
  respondedAt: string | null
  mentor: {
    id: string
    name: string
    email: string | null
    mentorProfile: string | null
    employer: string | null
    skills: string | null
    linkedin: string | null
  }
  mentee: {
    id: string
    name: string
    email: string | null
    menteeProfile: string | null
    employer: string | null
    skills: string | null
    linkedin: string | null
  }
  isSentByMe: boolean
  isReceivedByMe: boolean
}

type RequestSummary = {
  total: number
  pending: number
  accepted: number
  declined: number
}

type MentorshipMember = {
  id: string
  name: string
  email: string
  professionalQualification: string | null
  employer: string | null
  linkedin: string | null
  availableAsMentor: boolean
  mentorProfile: string | null
  seekingMentor: boolean
  menteeProfile: string | null
  isCurrentUser: boolean
}

export default function MentorshipDashboard() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [summary, setSummary] = useState<RequestSummary>({ total: 0, pending: 0, accepted: 0, declined: 0 })
  const [loading, setLoading] = useState(true)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null)
  const [response, setResponse] = useState('')
  const [responding, setResponding] = useState(false)
  const [members, setMembers] = useState<MentorshipMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [isProfessional, setIsProfessional] = useState(false)
  
  // Mentorship request dialog state
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<MentorshipMember | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestType, setRequestType] = useState('')
  const [preferredFormat, setPreferredFormat] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    
    const checkProfessionalStatus = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/auth/check-admin')
        const data = await response.json()
        setIsProfessional(data.isMember || data.isAdmin)
      } catch (error) {
        console.error('Error checking professional status:', error)
      }
    }
    
    if (status === 'authenticated') {
      checkProfessionalStatus()
      fetchRequests()
      fetchMembers()
    }
  }, [session, status])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/mentorship/requests')
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch mentorship requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/mentorship/browse')
      const data = await response.json()
      
      if (data.members) {
        console.log('Mentorship members fetched:', data.members)
        console.log('Total members:', data.members.length)
        console.log('Available mentors:', data.members.filter((m: MentorshipMember) => m.availableAsMentor && !m.isCurrentUser).length)
        console.log('Seeking mentors:', data.members.filter((m: MentorshipMember) => m.seekingMentor && !m.isCurrentUser).length)
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Failed to fetch mentorship members:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleResponse = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    setResponding(true)
    try {
      const apiResponse = await fetch('/api/mentorship/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          status,
          mentorResponse: response || undefined
        })
      })

      const result = await apiResponse.json()
      
      if (result.success) {
        setShowResponseDialog(false)
        setResponse('')
        await fetchRequests() // Refresh the data
      } else {
        alert(result.message || 'Failed to respond to request')
      }
    } catch (error) {
      console.error('Error responding to mentorship request:', error)
      alert('Failed to respond to request')
    } finally {
      setResponding(false)
    }
  }

  const openResponseDialog = (request: MentorshipRequest) => {
    setSelectedRequest(request)
    setShowResponseDialog(true)
    setResponse('')
  }

  const openRequestDialog = (mentor: MentorshipMember) => {
    setSelectedMentor(mentor)
    setShowRequestDialog(true)
    setRequestMessage('')
    setRequestType('')
    setPreferredFormat('')
  }

  const handleSubmitRequest = async () => {
    if (!selectedMentor || !requestMessage.trim() || !requestType) {
      alert('Please fill in all required fields')
      return
    }

    setSubmittingRequest(true)
    try {
      const response = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          message: requestMessage.trim(),
          requestType,
          preferredFormat: preferredFormat || null
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowRequestDialog(false)
        alert('Mentorship request sent successfully!')
        await fetchRequests() // Refresh the requests
      } else {
        alert(result.message || 'Failed to send mentorship request')
      }
    } catch (error) {
      console.error('Error sending mentorship request:', error)
      alert('Failed to send mentorship request')
    } finally {
      setSubmittingRequest(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>
      case 'DECLINED':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const sentRequests = requests.filter(r => r.isSentByMe)
  const receivedRequests = requests.filter(r => r.isReceivedByMe)

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-emerald-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl md:text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                  <p className="text-xs md:text-sm text-emerald-600">Mentorship Dashboard</p>
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </main>
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
                <p className="text-xs md:text-sm text-emerald-600">
                  {isProfessional && session ? `Welcome back, ${session.user?.name}!` : "Connecting Professionals in the Seattle Metro"}
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isProfessional && (
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
            <MobileNavigation session={session} isProfessional={isProfessional} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="text-emerald-600 hover:text-emerald-800">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">Mentorship Dashboard</h1>
              <p className="text-emerald-600">Manage your mentorship connections and find opportunities to grow</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/directory">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Find Mentors
              </Button>
            </Link>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{summary.accepted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Declined</p>
                  <p className="text-2xl font-bold text-red-600">{summary.declined}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Lists */}
        <Tabs defaultValue="available-mentors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="available-mentors">Available Mentors</TabsTrigger>
            <TabsTrigger value="seeking-mentors">Seeking Mentors</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available-mentors" className="space-y-4">
            {membersLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">

                {members.filter((m: MentorshipMember) => m.availableAsMentor && !m.isCurrentUser).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.filter((m: MentorshipMember) => m.availableAsMentor && !m.isCurrentUser).map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              {member.employer && (
                                <p className="text-sm text-emerald-700 flex items-center mt-1">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {member.employer}
                                </p>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 ml-3">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          </div>
                          
                          {member.mentorProfile && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{member.mentorProfile}</p>
                          )}
                          
                          {member.professionalQualification && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{member.professionalQualification}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                              <Star className="w-3 h-3 mr-1" />
                              Mentor
                            </Badge>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => openRequestDialog(member)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-all duration-200"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Connect
                              </button>
                              {member.linkedin && (
                                <a
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                                  title="View LinkedIn profile"
                                >
                                  <Linkedin className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No mentors available at the moment.</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Members can set themselves as mentors in their profile settings.
                      </p>
                      <Link href="/profile">
                        <Button variant="outline">
                          Update My Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="seeking-mentors" className="space-y-4">
            {membersLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {members.filter((m: MentorshipMember) => m.seekingMentor && !m.isCurrentUser).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.filter((m: MentorshipMember) => m.seekingMentor && !m.isCurrentUser).map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              {member.employer && (
                                <p className="text-sm text-blue-700 flex items-center mt-1">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {member.employer}
                                </p>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 ml-3">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          </div>
                          
                          {member.menteeProfile && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{member.menteeProfile}</p>
                          )}
                          
                          {member.professionalQualification && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{member.professionalQualification}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              <Users className="w-3 h-3 mr-1" />
                              Seeking Mentor
                            </Badge>
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                                title="View LinkedIn profile"
                              >
                                <Linkedin className="w-3 h-3" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No one is currently seeking mentors.</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Members can indicate they&apos;re seeking mentors in their profile settings.
                      </p>
                      <Link href="/profile">
                        <Button variant="outline">
                          Update My Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven&apos;t sent any mentorship requests yet.</p>
                  <Link href="/directory">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Find Mentors
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                          {request.mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.mentor.name}</h3>
                          <p className="text-sm text-gray-600">{request.mentor.employer}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Type:</p>
                        <p className="text-sm text-gray-600">{request.requestType}</p>
                      </div>
                      
                      {request.preferredFormat && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Preferred Format:</p>
                          <p className="text-sm text-gray-600">{request.preferredFormat}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-700">Your Message:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{request.message}</p>
                      </div>

                      {request.mentorResponse && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Mentor&apos;s Response:</p>
                          <p className="text-sm text-gray-600 bg-emerald-50 p-3 rounded-md border-l-4 border-emerald-400">
                            {request.mentorResponse}
                          </p>
                        </div>
                      )}

                      {request.contactShared && (
                        <div className="bg-green-50 p-3 rounded-md border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2">Contact Information Shared:</p>
                          <div className="space-y-1 text-sm text-green-700">
                            <p><strong>Email:</strong> {request.mentor.email}</p>
                            {request.mentor.linkedin && (
                              <p><strong>LinkedIn:</strong> <a href={request.mentor.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{request.mentor.linkedin}</a></p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Sent on {formatDate(request.createdAt)}
                      </p>
                      {request.respondedAt && (
                        <p className="text-xs text-gray-500">
                          Responded on {formatDate(request.respondedAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven&apos;t received any mentorship requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                          {request.mentee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.mentee.name}</h3>
                          <p className="text-sm text-gray-600">{request.mentee.employer}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Type:</p>
                        <p className="text-sm text-gray-600">{request.requestType}</p>
                      </div>
                      
                      {request.preferredFormat && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Preferred Format:</p>
                          <p className="text-sm text-gray-600">{request.preferredFormat}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-700">Message from {request.mentee.name}:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{request.message}</p>
                      </div>

                      {request.mentorResponse && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Your Response:</p>
                          <p className="text-sm text-gray-600 bg-emerald-50 p-3 rounded-md border-l-4 border-emerald-400">
                            {request.mentorResponse}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Received on {formatDate(request.createdAt)}
                      </p>
                      {request.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResponse(request.id, 'DECLINED')}
                            disabled={responding}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openResponseDialog(request)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={responding}
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Respond to Mentorship Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {selectedRequest.mentee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedRequest.mentee.name}</h3>
                  <p className="text-sm text-gray-600">{selectedRequest.mentee.employer}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Their request:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedRequest.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your response (optional)
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Add a personal message to your acceptance..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A personal message helps establish a good mentoring relationship!
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResponseDialog(false)}
                  disabled={responding}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleResponse(selectedRequest.id, 'ACCEPTED')}
                  disabled={responding}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {responding ? 'Accepting...' : 'Accept & Share Contact Info'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mentorship Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Mentorship Request</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                  {selectedMentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedMentor.name}</h3>
                  {selectedMentor.employer && (
                    <p className="text-sm text-gray-600">{selectedMentor.employer}</p>
                  )}
                  {selectedMentor.mentorProfile && (
                    <p className="text-sm text-emerald-700 mt-1">{selectedMentor.mentorProfile}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="requestType" className="text-sm font-medium text-gray-700">
                    Type of mentorship request *
                  </Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="career-advice">Career Advice</SelectItem>
                      <SelectItem value="informational-interview">Informational Interview</SelectItem>
                      <SelectItem value="skill-development">Skill Development</SelectItem>
                      <SelectItem value="networking">Professional Networking</SelectItem>
                      <SelectItem value="industry-insights">Industry Insights</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredFormat" className="text-sm font-medium text-gray-700">
                    Preferred meeting format
                  </Label>
                  <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select preferred format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video-call">Video Call</SelectItem>
                      <SelectItem value="phone-call">Phone Call</SelectItem>
                      <SelectItem value="coffee-chat">Coffee Chat</SelectItem>
                      <SelectItem value="email-exchange">Email Exchange</SelectItem>
                      <SelectItem value="flexible">I&apos;m flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Your message *
                  </Label>
                  <Textarea
                    id="message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Introduce yourself and explain what you're hoping to learn or discuss..."
                    className="mt-1 min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {requestMessage.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                  disabled={submittingRequest}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest || !requestMessage.trim() || !requestType}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submittingRequest ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                {session && isProfessional && (
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