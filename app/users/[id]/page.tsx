"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Building, 
  Linkedin, 
  ArrowLeft, 
  Calendar
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
// import MobileNavigation from "@/components/mobile-navigation"

type UserProfile = {
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
  image?: string
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const userId = params.id as string

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        } else {
          console.error('Failed to fetch user profile')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <MobileNavigation /> */}
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/forum" className="text-emerald-600 hover:text-emerald-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">User not found or profile not public.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <MobileNavigation /> */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/forum" className="text-emerald-600 hover:text-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-emerald-100 rounded-lg flex items-center justify-center">
                    {profile.image ? (
                      <Image 
                        src={profile.image} 
                        alt={profile.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-emerald-900">{profile.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {profile.availableAsMentor && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Available as Mentor
                    </Badge>
                  )}
                  {profile.seekingMentor && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      Seeking Mentor
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Professional Information */}
          {(profile.professionalQualification || profile.employer || profile.linkedin) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.professionalQualification && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Professional Qualification</h3>
                    <p className="text-gray-600">{profile.professionalQualification}</p>
                  </div>
                )}
                {profile.employer && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{profile.employer}</span>
                  </div>
                )}
                {profile.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interests & Contributions */}
          {(profile.interest || profile.contribution) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interests & Contributions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.interest && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Interests</h3>
                    <p className="text-gray-600">{profile.interest}</p>
                  </div>
                )}
                {profile.contribution && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">How they contribute</h3>
                    <p className="text-gray-600">{profile.contribution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mentorship */}
          {((profile.availableAsMentor && profile.mentorProfile) || (profile.seekingMentor && profile.menteeProfile)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.availableAsMentor && profile.mentorProfile && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Mentor Profile</h3>
                    <p className="text-gray-600">{profile.mentorProfile}</p>
                  </div>
                )}
                {profile.seekingMentor && profile.menteeProfile && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Mentee Profile</h3>
                    <p className="text-gray-600">{profile.menteeProfile}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}