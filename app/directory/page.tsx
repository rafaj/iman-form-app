"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Linkedin, Calendar, Mail, Phone, MapPin, Building2, GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"
import MobileNavigation from "@/components/mobile-navigation"

type DirectoryProfessional = {
  id: string
  name: string
  displayName: string
  image: string | null
  employer: string | null
  professionalQualification: string | null
  interest: string | null
  contribution: string | null
  linkedin: string | null
  skills: string | null
  school: string | null
  // Mentorship fields
  availableAsMentor: boolean
  mentorProfile: string | null
  seekingMentor: boolean
  menteeProfile: string | null
  professionalSince: string
  memberSince: string
  lastSeenAt: string | null
  initials: string
}

// Helper function to format "last seen" timestamp
function formatLastSeen(lastSeenAt: string): string {
  const now = new Date()
  const lastSeen = new Date(lastSeenAt)
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  // For longer periods, show the actual date
  return lastSeen.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffInDays > 365 ? 'numeric' : undefined
  })
}

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const [professionals, setProfessionals] = useState<DirectoryProfessional[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<DirectoryProfessional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfessional, setSelectedProfessional] = useState<DirectoryProfessional | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProfessional, setIsProfessional] = useState(false)
  const [viewMode, setViewMode] = useState<'alphabetical' | 'employer' | 'school' | 'recent'>('alphabetical')
  const [selectedEmployer, setSelectedEmployer] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)

  useEffect(() => {
    // Handle URL parameters for initial view mode
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('view') === 'recent') {
      setViewMode('recent')
    }
  }, [])

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

    if (!session) {
      redirect("/auth/signin")
    }
    
    checkProfessionalStatus()
    fetchProfessionals()
  }, [session, status])

  useEffect(() => {
    // Filter professionals based on search term
    if (searchTerm.trim() === "") {
      setFilteredProfessionals(professionals)
    } else {
      const filtered = professionals.filter(professional =>
        professional.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.employer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.professionalQualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.school?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProfessionals(filtered)
    }
  }, [searchTerm, professionals])

  const fetchProfessionals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/directory')
      const data = await response.json()
      
      if (data.success) {
        setProfessionals(data.members)
        setFilteredProfessionals(data.members)
      } else {
        setError(data.message || "Failed to load professional directory")
      }
    } catch (err) {
      setError("Failed to load professional directory")
      console.error('Error fetching professionals:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group professionals alphabetically
  const groupedProfessionals = filteredProfessionals.reduce((groups, professional) => {
    const firstLetter = professional.displayName[0].toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(professional)
    return groups
  }, {} as Record<string, DirectoryProfessional[]>)

  const alphabeticalSections = Object.keys(groupedProfessionals).sort()

  // Group professionals by employer
  const groupedByEmployer = filteredProfessionals.reduce((groups, professional) => {
    const employer = professional.employer || 'No employer listed'
    if (!groups[employer]) {
      groups[employer] = []
    }
    groups[employer].push(professional)
    return groups
  }, {} as Record<string, DirectoryProfessional[]>)

  const employerSections = Object.keys(groupedByEmployer).sort()

  // Group professionals by school (with parsing for multiple schools)
  const groupedBySchool = filteredProfessionals.reduce((groups, professional) => {
    if (!professional.school) {
      const noSchool = 'No school listed'
      if (!groups[noSchool]) {
        groups[noSchool] = []
      }
      groups[noSchool].push(professional)
      return groups
    }

    // Parse multiple schools from the education field
    const schools = parseSchools(professional.school)
    
    schools.forEach(school => {
      if (!groups[school]) {
        groups[school] = []
      }
      groups[school].push(professional)
    })
    
    return groups
  }, {} as Record<string, DirectoryProfessional[]>)

  // Helper function to parse multiple schools from education text
  function parseSchools(educationText: string): string[] {
    // Common separators: comma, semicolon, " and ", " & ", newlines
    const schools = educationText.split(/[,;]|\sand\s|\s&\s|\n/)
    
    return schools
      .map(school => {
        // Clean up each school entry
        let cleanSchool = school.trim()
        
        // Remove common degree abbreviations and parenthetical info for cleaner grouping
        // But preserve the school name
        cleanSchool = cleanSchool
          .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content like "(BS)", "(MBA)", "(2018-2022)"
          .replace(/\s*-\s*\d{4}.*$/g, '') // Remove graduation years like "- 2020" or "- 2018-2022"
          .replace(/\s*'\d{2,4}$/g, '') // Remove apostrophe years like "'20" or "'2020"
          .replace(/\s*\b(BS|BA|MS|MA|MBA|PhD|PharmD|MD|JD|LLM)\b.*$/gi, '') // Remove degree types at end
          .trim()
        
        // Skip if empty after cleaning
        if (!cleanSchool) return null
        
        // Normalize common university name variations
        cleanSchool = normalizeSchoolName(cleanSchool)
        
        return cleanSchool
      })
      .filter((school): school is string => school !== null && school.length > 0)
      .filter((school, index, array) => array.indexOf(school) === index) // Remove duplicates
  }

  // Helper function to normalize school names
  function normalizeSchoolName(school: string): string {
    // Common abbreviations and variations
    const normalizations: Record<string, string> = {
      'UW': 'University of Washington',
      'U of W': 'University of Washington',
      'UDub': 'University of Washington',
      'WSU': 'Washington State University',
      'WWU': 'Western Washington University',
      'CWU': 'Central Washington University',
      'EWU': 'Eastern Washington University',
      'Seattle U': 'Seattle University',
      'UC Berkeley': 'University of California, Berkeley',
      'UC Davis': 'University of California, Davis',
      'UC San Diego': 'University of California, San Diego',
      'UCSD': 'University of California, San Diego',
      'UCLA': 'University of California, Los Angeles',
      'USC': 'University of Southern California',
      'MIT': 'Massachusetts Institute of Technology',
      'NYU': 'New York University',
      'ASU': 'Arizona State University',
      'OSU': 'Oregon State University',
      'UT Austin': 'University of Texas at Austin'
    }

    // Check for exact matches first
    if (normalizations[school]) {
      return normalizations[school]
    }

    // Check for partial matches (case insensitive)
    const lowerSchool = school.toLowerCase()
    for (const [abbrev, fullName] of Object.entries(normalizations)) {
      if (lowerSchool === abbrev.toLowerCase()) {
        return fullName
      }
    }

    return school
  }

  const schoolSections = Object.keys(groupedBySchool).sort()

  // Sort professionals by join date for recent view
  const professionalsByJoinDate = [...filteredProfessionals].sort((a, b) => 
    new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime()
  )

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
                  <p className="text-xs md:text-sm text-emerald-600">Professional Directory</p>
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-emerald-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl md:text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                  <p className="text-xs md:text-sm text-emerald-600">Professional Directory</p>
                </div>
              </div>
              {session && (
                <div className="flex items-center space-x-3">
                  <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
                    {session.user?.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-xl font-bold text-emerald-800 mb-4">
              Professional Directory
            </h1>
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchProfessionals} variant="outline">
              Try Again
            </Button>
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
                <p className="text-xs md:text-sm text-emerald-600">Professional Directory</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isProfessional && (
                    <>
                      <Link href="/directory" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Directory</Link>
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
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Professional Sign In
                  </Link>
                  <Link href="/apply">
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Become a Professional
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-xl font-bold text-emerald-800">
            Professional Directory
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect with {professionals.length} professionals in the IMAN network
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search professionals, companies, skills, schools, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'alphabetical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('alphabetical')
                  setSelectedEmployer(null)
                  setSelectedSchool(null)
                }}
                className={`w-full sm:w-auto ${viewMode === 'alphabetical' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                <Users className="h-4 w-4 mr-2" />
                Alphabetical
              </Button>
              <Button
                variant={viewMode === 'employer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('employer')
                  setSelectedEmployer(null)
                  setSelectedSchool(null)
                }}
                className={`w-full sm:w-auto ${viewMode === 'employer' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Employers represented at IMAN</span>
                <span className="sm:hidden">Employers</span>
              </Button>
              <Button
                variant={viewMode === 'school' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('school')
                  setSelectedEmployer(null)
                  setSelectedSchool(null)
                }}
                className={`w-full sm:w-auto ${viewMode === 'school' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Schools represented at IMAN</span>
                <span className="sm:hidden">Schools</span>
              </Button>
              <Button
                variant={viewMode === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('recent')
                  setSelectedEmployer(null)
                  setSelectedSchool(null)
                }}
                className={`w-full sm:w-auto ${viewMode === 'recent' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Recently Joined
              </Button>
            </div>
            {viewMode === 'employer' && selectedEmployer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmployer(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to all employers
              </Button>
            )}
            {viewMode === 'school' && selectedSchool && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSchool(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to all schools
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        {viewMode === 'alphabetical' ? (
          // Alphabetical View
          alphabeticalSections.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No professionals found matching your search.</p>
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
                    {groupedProfessionals[letter].map(professional => (
                      <Card 
                        key={professional.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                        onClick={() => setSelectedProfessional(professional)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {professional.image ? (
                                <Image
                                  src={professional.image}
                                  alt={professional.displayName}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-full border-2 border-emerald-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                                  {professional.initials}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-emerald-900 truncate">
                                {professional.displayName}
                              </h3>
                              {professional.employer && (
                                <p className="text-sm text-emerald-700 truncate mt-1">
                                  {professional.employer}
                                </p>
                              )}
                              {professional.professionalQualification && (
                                <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                                  {professional.professionalQualification}
                                </p>
                              )}
                              {professional.skills && (
                                <p className="text-xs text-gray-600 line-clamp-1 mt-2">
                                  <span className="text-emerald-700 font-medium">Skills:</span> {professional.skills}
                                </p>
                              )}
                              {professional.school && (
                                <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                  <span className="text-emerald-700 font-medium">Education:</span> {professional.school}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {professional.lastSeenAt 
                                    ? `Last seen ${formatLastSeen(professional.lastSeenAt)}`
                                    : 'Never logged in'
                                  }
                                </div>
                                {professional.linkedin && (
                                  <a
                                    href={professional.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Linkedin className="w-3 h-3" />
                                  </a>
                                )}
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
          )
        ) : viewMode === 'school' ? (
          // School View
          schoolSections.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No schools found matching your search.</p>
            </div>
          ) : selectedSchool ? (
            // Show professionals from selected school
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <GraduationCap className="w-6 h-6 text-emerald-600 mr-3" />
                  <h2 className="text-xl font-semibold text-emerald-900">{selectedSchool}</h2>
                  <span className="ml-3 text-sm text-gray-600">
                    ({groupedBySchool[selectedSchool]?.length || 0} professional{(groupedBySchool[selectedSchool]?.length || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groupedBySchool[selectedSchool] || []).map(professional => (
                  <Card 
                    key={professional.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                    onClick={() => setSelectedProfessional(professional)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {professional.image ? (
                            <Image
                              src={professional.image}
                              alt={professional.displayName}
                              width={48}
                              height={48}
                              className="rounded-full border-2 border-emerald-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center border-2 border-emerald-200">
                              <Users className="h-6 w-6 text-emerald-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-emerald-900 truncate">
                            {professional.displayName}
                          </h3>
                          {professional.employer && (
                            <p className="text-sm text-emerald-700 truncate mt-1">
                              {professional.employer}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <div className="flex items-center text-emerald-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined {new Date(professional.memberSince).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {professional.linkedin && (
                              <a
                                href={professional.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {professional.professionalQualification && (
                            <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                              {professional.professionalQualification}
                            </p>
                          )}
                          {professional.skills && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-2">
                              <span className="text-emerald-700 font-medium">Skills:</span> {professional.skills}
                            </p>
                          )}
                          {professional.school && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                              <span className="text-emerald-700 font-medium">Education:</span> {professional.school}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Show list of schools
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-emerald-900 mb-4">
                Schools and Universities ({schoolSections.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolSections.map(school => (
                  <Card
                    key={school}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                    onClick={() => setSelectedSchool(school)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <GraduationCap className="w-8 h-8 text-emerald-600 mr-4 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-medium text-emerald-900 truncate">
                              {school}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {groupedBySchool[school].length} professional{groupedBySchool[school].length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-emerald-600 rotate-180 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ) : viewMode === 'recent' ? (
          // Recently Joined View
          professionalsByJoinDate.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No professionals found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-emerald-900 mb-4">
                Professionals by Join Date ({professionalsByJoinDate.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionalsByJoinDate.map(professional => (
                  <Card 
                    key={professional.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                    onClick={() => setSelectedProfessional(professional)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {professional.image ? (
                            <Image
                              src={professional.image}
                              alt={professional.displayName}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full border-2 border-emerald-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                              {professional.initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-emerald-900 truncate">
                            {professional.displayName}
                          </h3>
                          {professional.employer && (
                            <p className="text-sm text-emerald-700 truncate mt-1">
                              {professional.employer}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <div className="flex items-center text-emerald-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined {new Date(professional.memberSince).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {professional.linkedin && (
                              <a
                                href={professional.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {professional.professionalQualification && (
                            <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                              {professional.professionalQualification}
                            </p>
                          )}
                          {professional.skills && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-2">
                              <span className="text-emerald-700 font-medium">Skills:</span> {professional.skills}
                            </p>
                          )}
                          {professional.school && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                              <span className="text-emerald-700 font-medium">Education:</span> {professional.school}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ) : (
          // Employer View
          employerSections.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No employers found matching your search.</p>
            </div>
          ) : selectedEmployer ? (
            // Show professionals from selected employer
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <Building2 className="w-6 h-6 text-emerald-600 mr-3" />
                  <h2 className="text-xl font-semibold text-emerald-900">{selectedEmployer}</h2>
                  <span className="ml-3 text-sm text-gray-600">
                    ({groupedByEmployer[selectedEmployer]?.length || 0} professional{(groupedByEmployer[selectedEmployer]?.length || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groupedByEmployer[selectedEmployer] || []).map(professional => (
                  <Card 
                    key={professional.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100"
                    onClick={() => setSelectedProfessional(professional)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {professional.image ? (
                            <Image
                              src={professional.image}
                              alt={professional.displayName}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full border-2 border-emerald-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                              {professional.initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-emerald-900 truncate">
                            {professional.displayName}
                          </h3>
                          {professional.professionalQualification && (
                            <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                              {professional.professionalQualification}
                            </p>
                          )}
                          {professional.skills && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-2">
                              <span className="text-emerald-700 font-medium">Skills:</span> {professional.skills}
                            </p>
                          )}
                          {professional.school && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                              <span className="text-emerald-700 font-medium">Education:</span> {professional.school}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {professional.lastSeenAt 
                                ? `Last seen ${formatLastSeen(professional.lastSeenAt)}`
                                : 'Never logged in'
                              }
                            </div>
                            {professional.linkedin && (
                              <a
                                href={professional.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Show list of employers
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-emerald-900 mb-4">
                Companies and Organizations ({employerSections.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employerSections.map(employer => (
                  <Card 
                    key={employer}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100 hover:border-emerald-300"
                    onClick={() => setSelectedEmployer(employer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-emerald-900 truncate">
                              {employer}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {groupedByEmployer[employer].length} professional{groupedByEmployer[employer].length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-emerald-600">
                          <ArrowLeft className="w-4 h-4 transform rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}

        {/* Professional Detail Modal */}
        {selectedProfessional && (
          <Dialog open={!!selectedProfessional} onOpenChange={() => setSelectedProfessional(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-emerald-900">
                  Professional Profile
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4 pb-4 border-b border-emerald-200">
                  {selectedProfessional.image ? (
                    <Image
                      src={selectedProfessional.image}
                      alt={selectedProfessional.displayName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-2 border-emerald-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xl">
                      {selectedProfessional.initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-emerald-900">
                      {selectedProfessional.displayName}
                    </h2>
                    {selectedProfessional.employer && (
                      <p className="text-emerald-700 font-medium">
                        {selectedProfessional.employer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  {selectedProfessional.professionalQualification && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Qualification</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProfessional.professionalQualification}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.interest && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Interests</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProfessional.interest}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.contribution && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">How I can help IMAN?</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProfessional.contribution}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.skills && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Skills</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProfessional.skills}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.school && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Education</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProfessional.school}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.linkedin && (
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Professional Network</h4>
                      <a
                        href={selectedProfessional.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  {!selectedProfessional.professionalQualification && !selectedProfessional.interest && !selectedProfessional.contribution && !selectedProfessional.skills && !selectedProfessional.school && !selectedProfessional.linkedin && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Professional information not yet provided.</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-emerald-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {selectedProfessional.lastSeenAt 
                        ? `Last seen ${formatLastSeen(selectedProfessional.lastSeenAt)}`
                        : 'Never logged in'
                      }
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