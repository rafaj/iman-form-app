"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Member = {
  id: string
  name: string
  email: string
  active: boolean
  professionalQualification: string
  interest: string
  contribution: string
  employer: string
  linkedin: string
  createdAt: string
  updatedAt: string
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const [memberId, setMemberId] = useState<string>("")
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Member>>({})
  
  const router = useRouter()
  const { toast } = useToast()

  // Get member ID from params
  useEffect(() => {
    params.then(p => setMemberId(p.id))
  }, [params])

  const fetchMember = useCallback(async () => {
    if (!memberId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/members/${memberId}/edit`, {
        credentials: 'include'
      })

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()

      if (data.success) {
        setMember(data.member)
        setFormData(data.member)
      } else {
        setError(data.message || 'Failed to fetch member details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member details')
    } finally {
      setLoading(false)
    }
  }, [memberId, router])

  useEffect(() => {
    if (memberId) {
      fetchMember()
    }
  }, [memberId, fetchMember])

  const handleInputChange = (field: keyof Member, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!memberId || !formData) return

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/members/${memberId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Member updated",
          description: `${data.member.name} has been updated successfully.`,
        })
        router.push('/admin')
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Failed to update member.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Save failed:', error)
      toast({
        title: "Update failed",
        description: "There was an error updating the member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading member details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Alert>
            <AlertDescription>Member not found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-emerald-900">Edit Member</h1>
          <p className="text-emerald-700 mt-2">Update member profile and details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>
              Edit all member details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active || false}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <Label htmlFor="active">Active Member</Label>
            </div>

            {/* Address Information - Hidden for Privacy */}
            {/* Address fields are hidden to protect member privacy */}

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-900">Professional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="professionalQualification">Professional Qualification</Label>
                <Textarea
                  id="professionalQualification"
                  value={formData.professionalQualification || ""}
                  onChange={(e) => handleInputChange('professionalQualification', e.target.value)}
                  placeholder="Describe professional background and qualifications"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Current Employer</Label>
                <Input
                  id="employer"
                  value={formData.employer || ""}
                  onChange={(e) => handleInputChange('employer', e.target.value)}
                  placeholder="Enter current employer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin || ""}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            {/* Interest and Contribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-900">IMAN Network Involvement</h3>
              <div className="space-y-2">
                <Label htmlFor="interest">Interest in IMAN</Label>
                <Textarea
                  id="interest"
                  value={formData.interest || ""}
                  onChange={(e) => handleInputChange('interest', e.target.value)}
                  placeholder="Describe interest in joining IMAN Professional Network"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contribution">How They Contribute</Label>
                <Textarea
                  id="contribution"
                  value={formData.contribution || ""}
                  onChange={(e) => handleInputChange('contribution', e.target.value)}
                  placeholder="Describe how they contribute to the network"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href="/admin">
                <Button variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
