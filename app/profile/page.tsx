"use client"

import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Calendar, Settings, Edit, Save, X, Linkedin, Building, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import MobileNavigation from "@/components/mobile-navigation"

type MemberProfile = {
  id: string
  name: string
  email: string
  professionalQualification?: string
  interest?: string
  contribution?: string
  employer?: string
  linkedin?: string
  availableAsMentor: boolean
  mentorProfile?: string
  seekingMentor: boolean
  menteeProfile?: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [formData, setFormData] = useState({
    professionalQualification: "",
    interest: "",
    contribution: "",
    employer: "",
    linkedin: "",
    availableAsMentor: false,
    mentorProfile: "",
    seekingMentor: false,
    menteeProfile: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      checkMemberStatus()
      fetchProfile()
    }
  }, [session])

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

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.member)
        setFormData({
          professionalQualification: data.member.professionalQualification || "",
          interest: data.member.interest || "",
          contribution: data.member.contribution || "",
          employer: data.member.employer || "",
          linkedin: data.member.linkedin || "",
          availableAsMentor: data.member.availableAsMentor || false,
          mentorProfile: data.member.mentorProfile || "",
          seekingMentor: data.member.seekingMentor || false,
          menteeProfile: data.member.menteeProfile || "",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.member)
        setEditing(false)
        toast({
          title: "Profile Updated",
          description: "Your professional information has been saved successfully.",
        })
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        professionalQualification: profile.professionalQualification || "",
        interest: profile.interest || "",
        contribution: profile.contribution || "",
        employer: profile.employer || "",
        linkedin: profile.linkedin || "",
        availableAsMentor: profile.availableAsMentor || false,
        mentorProfile: profile.mentorProfile || "",
        seekingMentor: profile.seekingMentor || false,
        menteeProfile: profile.menteeProfile || "",
      })
    }
    setEditing(false)
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="text-center">Loading profile...</div>
        </section>
      </main>
    )
  }

  if (!session) {
    redirect("/auth/signin")
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
                <p className="text-xs md:text-sm text-emerald-600">Member Profile</p>
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
                        className="w-8 h-8 rounded-full"
                        width={32}
                        height={32}
                      />
                    )}
                    <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors border-b-2 border-emerald-600">
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
                    Member Sign In
                  </Link>
                  <Link href="/apply">
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Become a Member
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">
            Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your IMAN Professional Network profile
          </p>
        </header>

        <div className="grid gap-6">
          {/* Basic Information Card */}
          <Card className="border-emerald-100">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-16 h-16 rounded-full border-2 border-emerald-200"
                    width={64}
                    height={64}
                  />
                )}
                <div>
                  <CardTitle className="text-2xl text-emerald-900">
                    {session.user?.name}
                  </CardTitle>
                  <CardDescription className="text-emerald-700">
                    IMAN Professional Network Member
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <p className="font-medium">{session.user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    Account Type
                  </div>
                  <Badge variant="secondary">
                    Member
                  </Badge>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  Your basic profile information (name and photo) is managed through your OAuth provider. 
                  To update these, please update them in your Google/GitHub/Apple account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card className="border-emerald-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <User className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                  <CardDescription>
                    Your professional background and involvement with IMAN
                  </CardDescription>
                </div>
                {!editing && (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    size="sm"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {editing ? (
                <div className="space-y-6">
                  {/* Professional Qualification */}
                  <div className="space-y-2">
                    <Label htmlFor="professionalQualification">Professional Qualification</Label>
                    <Textarea
                      id="professionalQualification"
                      value={formData.professionalQualification}
                      onChange={(e) => setFormData(prev => ({ ...prev, professionalQualification: e.target.value }))}
                      placeholder="Describe your professional background, education, and qualifications..."
                      rows={3}
                    />
                  </div>

                  {/* Current Employer */}
                  <div className="space-y-2">
                    <Label htmlFor="employer">Current Employer</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                      placeholder="Your current company or organization"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>

                  {/* Professional Interests */}
                  <div className="space-y-2">
                    <Label htmlFor="interest">Professional Interests</Label>
                    <Textarea
                      id="interest"
                      value={formData.interest}
                      onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                      placeholder="What are your professional interests and areas of expertise?"
                      rows={3}
                    />
                  </div>

                  {/* How I can help IMAN */}
                  <div className="space-y-2">
                    <Label htmlFor="contribution">How I can help IMAN?</Label>
                    <Textarea
                      id="contribution"
                      value={formData.contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
                      placeholder="How can you contribute to the IMAN Professional Network?"
                      rows={3}
                    />
                  </div>

                  {/* Mentorship Section */}
                  <div className="pt-6 border-t border-emerald-200">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">Professional Development</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      IMAN connects members for mentorship and professional growth. Update your preferences below.
                    </p>
                    
                    <div className="space-y-6">
                      {/* Available as Mentor */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="availableAsMentor"
                            checked={formData.availableAsMentor}
                            onChange={(e) => setFormData(prev => ({ ...prev, availableAsMentor: e.target.checked }))}
                            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label htmlFor="availableAsMentor" className="text-sm font-medium">
                            I&apos;m available as a mentor
                          </Label>
                        </div>
                        {formData.availableAsMentor && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor="mentorProfile" className="text-sm">
                              What areas can you mentor in? (e.g., &quot;Data Science, Career Transitions, Leadership&quot;)
                            </Label>
                            <Textarea
                              id="mentorProfile"
                              value={formData.mentorProfile}
                              onChange={(e) => setFormData(prev => ({ ...prev, mentorProfile: e.target.value }))}
                              placeholder="Share your expertise and what you'd enjoy mentoring others in..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>

                      {/* Seeking Mentor */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="seekingMentor"
                            checked={formData.seekingMentor}
                            onChange={(e) => setFormData(prev => ({ ...prev, seekingMentor: e.target.checked }))}
                            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label htmlFor="seekingMentor" className="text-sm font-medium">
                            I&apos;m seeking mentorship
                          </Label>
                        </div>
                        {formData.seekingMentor && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor="menteeProfile" className="text-sm">
                              What would you like guidance on? (e.g., &quot;Breaking into Tech, MBA Applications, Entrepreneurship&quot;)
                            </Label>
                            <Textarea
                              id="menteeProfile"
                              value={formData.menteeProfile}
                              onChange={(e) => setFormData(prev => ({ ...prev, menteeProfile: e.target.value }))}
                              placeholder="Share what you'd like to learn or get guidance on..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-emerald-200">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Professional Qualification */}
                  {profile?.professionalQualification && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900">Professional Qualification</h4>
                      <div className="bg-white p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.professionalQualification}</p>
                      </div>
                    </div>
                  )}

                  {/* Current Employer */}
                  {profile?.employer && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Current Employer
                      </h4>
                      <p className="text-sm text-gray-700">{profile.employer}</p>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {profile?.linkedin && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900 flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                      </h4>
                      <a 
                        href={profile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {profile.linkedin}
                      </a>
                    </div>
                  )}

                  {/* Professional Interests */}
                  {profile?.interest && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900">Professional Interests</h4>
                      <div className="bg-white p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.interest}</p>
                      </div>
                    </div>
                  )}

                  {/* How I can help IMAN */}
                  {profile?.contribution && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-900">How I can help IMAN?</h4>
                      <div className="bg-white p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.contribution}</p>
                      </div>
                    </div>
                  )}

                  {/* Mentorship Information */}
                  {(profile?.availableAsMentor || profile?.seekingMentor) && (
                    <div className="space-y-4 pt-6 border-t border-emerald-200">
                      <h4 className="font-medium text-emerald-900">Professional Development</h4>
                      
                      {profile.availableAsMentor && (
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              Available as Mentor
                            </Badge>
                          </div>
                          {profile.mentorProfile && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.mentorProfile}</p>
                          )}
                        </div>
                      )}
                      
                      {profile.seekingMentor && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Seeking Mentorship
                            </Badge>
                          </div>
                          {profile.menteeProfile && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.menteeProfile}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {!profile?.professionalQualification && !profile?.employer && !profile?.linkedin && 
                   !profile?.interest && !profile?.contribution && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No professional information added yet</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Share your professional background and involvement with the IMAN community
                      </p>
                      <Button
                        onClick={() => setEditing(true)}
                        variant="outline"
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Professional Information
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          {profile && (
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Calendar className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
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