"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Upload, ExternalLink, Trash2, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
type Member = {
  id: string
  name: string
  description: string
  website?: string
  logoUrl?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface MemberSpotlightTabProps {
  members: Member[]
  onRefresh: () => void
}

export default function MemberSpotlightTab({ members, onRefresh }: MemberSpotlightTabProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    website: string
  }>({
    name: '',
    description: '',
    website: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, WebP, or SVG image.",
          variant: "destructive"
        })
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive"
        })
        return
      }

      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation error",
        description: "Name and description are required.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      let logoUrl = ''

      // Upload logo if provided
      if (logoFile) {
        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('logo', logoFile)

        const uploadResponse = await fetch('/api/admin/member-spotlight/upload', {
          method: 'POST',
          body: uploadFormData,
          credentials: 'include'
        })

        const uploadData = await uploadResponse.json()

        if (uploadData.success) {
          logoUrl = uploadData.logoUrl
        } else {
          throw new Error(uploadData.message || 'Failed to upload logo')
        }
        setIsUploading(false)
      }

      // Create member spotlight entry
      const memberData = {
        ...formData,
        logoUrl: logoUrl || null,
        website: formData.website.trim() || null
      }

      const response = await fetch('/api/admin/member-spotlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Member added to spotlight",
          description: `${formData.name} has been added to Member Spotlight successfully.`
        })
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          website: ''
        })
        setLogoFile(null)
        setLogoPreview(null)
        setShowAddForm(false)
        
        // Refresh data
        onRefresh()
      } else {
        throw new Error(data.message || 'Failed to add member to spotlight')
      }
    } catch (error) {
      console.error('Add member to spotlight failed:', error)
      toast({
        title: "Failed to add member to spotlight",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async (member: Member) => {
    if (!confirm(`Are you sure you want to remove "${member.name}" from Member Spotlight?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/member-spotlight/${member.id}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Member removed from spotlight",
          description: `${member.name} has been removed from Member Spotlight successfully.`
        })
        onRefresh()
      } else {
        throw new Error(data.message || 'Failed to remove member from spotlight')
      }
    } catch (error) {
      console.error('Delete member spotlight failed:', error)
      toast({
        title: "Failed to remove member from spotlight",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Member Spotlight ({members.length})
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardTitle>
          <CardDescription>
            Highlight community members and organizations that support the IMAN Professional Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Add to Member Spotlight</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Dr. Ahmad Khan, TechCorp Inc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of their contribution to the community"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Logo Image</Label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    {logoFile && (
                      <span className="text-sm text-gray-600">{logoFile.name}</span>
                    )}
                  </div>
                  {logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-16 w-auto object-contain border border-gray-200 rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Adding...' : 'Add to Spotlight'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormData({ name: '', description: '', website: '' })
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {members.map((member) => (
              <div key={member.id} className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {member.logoUrl ? (
                      <img
                        src={member.logoUrl}
                        alt={`${member.name} logo`}
                        className="h-16 w-16 object-contain border border-gray-200 rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900">{member.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={member.active ? "default" : "secondary"}>
                          {member.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700">{member.description}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Added: {formatDate(member.createdAt)}</span>
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {member.id}
                  </div>
                </div>
              </div>
            ))}

            {members.length === 0 && !showAddForm && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No members in spotlight yet</p>
                <p className="text-sm text-gray-400 mb-4">Add your first member to get started</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
