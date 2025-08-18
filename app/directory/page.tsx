"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Linkedin, Calendar, X } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

type DirectoryMember = {
  id: string
  name: string
  displayName: string
  image: string | null
  employer: string | null
  professionalQualification: string | null
  interest: string | null
  contribution: string | null
  linkedin: string | null
  memberSince: string
  initials: string
}

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<DirectoryMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      redirect("/auth/signin")
    }
    
    fetchMembers()
  }, [session, status])

  useEffect(() => {
    // Filter members based on search term
    if (searchTerm.trim() === "") {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter(member =>
        member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.professionalQualification?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMembers(filtered)
    }
  }, [searchTerm, members])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/directory')
      const data = await response.json()
      
      if (data.success) {
        setMembers(data.members)
        setFilteredMembers(data.members)
      } else {
        setError(data.message || "Failed to load member directory")
      }
    } catch (err) {
      setError("Failed to load member directory")
      console.error('Error fetching members:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group members alphabetically
  const groupedMembers = filteredMembers.reduce((groups, member) => {
    const firstLetter = member.displayName[0].toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(member)
    return groups
  }, {} as Record<string, DirectoryMember[]>)

  const alphabeticalSections = Object.keys(groupedMembers).sort()

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-64 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-900 mb-4">
              Member Directory
            </h1>
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchMembers} variant="outline">
              Try Again
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">
            Member Directory
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect with {members.length} professionals in the IMAN network
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search members, companies, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Members Grid */}
        {alphabeticalSections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No members found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {alphabeticalSections.map(letter => (
              <div key={letter}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                    {letter}
                  </div>
                  <div className="flex-1 h-px bg-emerald-200"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedMembers[letter].map(member => (
                    <Card 
                      key={member.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                      onClick={() => setSelectedMember(member)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.displayName}
                                className="w-12 h-12 rounded-full border-2 border-emerald-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                                {member.initials}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-emerald-900 truncate">
                              {member.displayName}
                            </h3>
                            {member.employer && (
                              <p className="text-sm text-emerald-700 truncate mt-1">
                                {member.employer}
                              </p>
                            )}
                            {member.professionalQualification && (
                              <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                                {member.professionalQualification}
                              </p>
                            )}
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Member since {new Date(member.memberSince).getFullYear()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold text-emerald-900">
                    Member Profile
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4 pb-4 border-b border-emerald-200">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.displayName}
                      className="w-16 h-16 rounded-full border-2 border-emerald-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xl">
                      {selectedMember.initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-emerald-900">
                      {selectedMember.displayName}
                    </h2>
                    {selectedMember.employer && (
                      <p className="text-emerald-700 font-medium">
                        {selectedMember.employer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  {selectedMember.professionalQualification && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Qualification</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedMember.professionalQualification}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMember.interest && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Interests</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedMember.interest}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMember.contribution && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">How I can help IMAN?</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedMember.contribution}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMember.linkedin && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Network</h4>
                      <a
                        href={selectedMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t border-emerald-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {new Date(selectedMember.memberSince).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}