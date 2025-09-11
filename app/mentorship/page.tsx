"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Clock, CheckCircle, XCircle, User, Calendar, ArrowLeft, Star, Users, Linkedin, Building2 } from "lucide-react"
import Link from "next/link"

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
  const { status } = useSession()
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [summary, setSummary] = useState<RequestSummary>({ total: 0, pending: 0, accepted: 0, declined: 0 })
  const [loading, setLoading] = useState(true)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null)
  const [response, setResponse] = useState('')
  const [responding, setResponding] = useState(false)
  const [members, setMembers] = useState<MentorshipMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests()
      fetchMembers()
    }
  }, [status])

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
        console.log('Available mentors:', data.members.filter(m => m.availableAsMentor && !m.isCurrentUser).length)
        console.log('Seeking mentors:', data.members.filter(m => m.seekingMentor && !m.isCurrentUser).length)
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
        <header className="bg-white shadow-sm border-b border-emerald-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-bold text-emerald-900">Mentorship Dashboard</h1>
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
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-emerald-600 hover:text-emerald-800">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-emerald-900">Mentorship Dashboard</h1>
                <p className="text-sm text-emerald-600">Manage your mentorship connections</p>
              </div>
            </div>
            <Link href="/directory">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Find Mentors
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Members</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
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
                {/* Available Mentors */}
                {members.filter(m => m.availableAsMentor && !m.isCurrentUser).length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-emerald-600 mr-2" />
                      <h3 className="text-lg font-semibold text-emerald-900">Available Mentors</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.filter(m => m.availableAsMentor && !m.isCurrentUser).map((member) => (
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
                                  onClick={() => {
                                    // Handle mentorship request from dashboard
                                    window.location.href = `/directory?mentor=${member.id}`
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-all duration-200"
                                  title="Request mentorship"
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
                  </div>
                )}

                {/* Seeking Mentors */}
                {members.filter(m => m.seekingMentor && !m.isCurrentUser).length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-blue-900">Seeking Mentors</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.filter(m => m.seekingMentor && !m.isCurrentUser).map((member) => (
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
                  </div>
                )}

                {/* Debug information (temporary) */}
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold">Debug Info:</h4>
                  <p>Total members: {members.length}</p>
                  <p>Available mentors: {members.filter(m => m.availableAsMentor && !m.isCurrentUser).length}</p>
                  <p>Seeking mentors: {members.filter(m => m.seekingMentor && !m.isCurrentUser).length}</p>
                  <p>Members with mentorship flags: {members.filter(m => m.availableAsMentor || m.seekingMentor).length}</p>
                  {members.length > 0 && (
                    <details>
                      <summary>Raw member data (first 3)</summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40">
                        {JSON.stringify(members.slice(0, 3), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Empty state if no mentors or mentees */}
                {members.filter(m => !m.isCurrentUser && (m.availableAsMentor || m.seekingMentor)).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No mentors or mentees available at the moment.</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Members can set themselves as mentors or indicate they&apos;re seeking mentors in their profile settings.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Link href="/directory">
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            View All Members
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button variant="outline">
                            Update My Profile
                          </Button>
                        </Link>
                      </div>
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
    </div>
  )
}