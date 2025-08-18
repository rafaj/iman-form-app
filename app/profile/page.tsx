"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Calendar, Settings, Edit, Save, X, Linkedin, Building } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type MemberProfile = {
  id: string
  name: string
  email: string
  professionalQualification?: string
  interest?: string
  contribution?: string
  employer?: string
  linkedin?: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    professionalQualification: "",
    interest: "",
    contribution: "",
    employer: "",
    linkedin: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

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
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-4xl px-4 py-10">
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
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-16 h-16 rounded-full border-2 border-emerald-200"
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
      </section>
    </main>
  )
}