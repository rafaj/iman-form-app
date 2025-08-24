"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Linkedin, Calendar, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
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
  professionalSince: string
  initials: string
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
        professional.professionalQualification?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <p className="text-xs md:text-sm text-emerald-600">Member Directory</p>
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
            Member Directory
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect with {professionals.length} professionals in the IMAN network
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search professionals, companies, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Professionals Grid */}
        {alphabeticalSections.length === 0 ? (
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
                              <img
                                src={professional.image}
                                alt={professional.displayName}
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
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Professional since {new Date(professional.professionalSince).getFullYear()}
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
                    <img
                      src={selectedProfessional.image}
                      alt={selectedProfessional.displayName}
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

                  {!selectedProfessional.professionalQualification && !selectedProfessional.interest && !selectedProfessional.contribution && !selectedProfessional.linkedin && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Professional information not yet provided.</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-emerald-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Professional since {new Date(selectedProfessional.professionalSince).toLocaleDateString('en-US', {
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