"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Linkedin, LogOut, Shield, Trash2, Edit, Building2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import MemberSpotlightTab from "@/components/admin/SponsorsTab"

type Member = {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: string
  approvalsInWindow: number
  lastApprovalAt: string | null
  // Application details
  streetAddress: string | null
  city: string | null
  state: string | null
  zip: string | null
  professionalQualification: string | null
  interest: string | null
  contribution: string | null
  employer: string | null
  linkedin: string | null
  applicationDate: string | null
  approvedDate: string | null
}

type Application = {
  id: string
  token: string
  applicantName: string
  applicantEmail: string
  sponsorEmail: string
  status: string
  createdAt: string
  expiresAt: string
  streetAddress: string
  city: string
  state: string
  zip: string
  professionalQualification: string
  interest: string
  contribution: string
  employer?: string
  linkedin?: string
}

type SpotlightMember = {
  id: string
  name: string
  description: string
  website?: string
  logoUrl?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [spotlightMembers, setSpotlightMembers] = useState<SpotlightMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [addMemberForm, setAddMemberForm] = useState({
    name: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    professionalQualification: '',
    interest: '',
    contribution: '',
    employer: '',
    linkedin: ''
  })
  const [addingMember, setAddingMember] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check-auth', {
        credentials: 'include' // Include cookies for authentication
      })
      const data = await response.json()
      
      if (data.authenticated) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setCheckingAuth(false)
    }
  }, [router])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch members
      const membersRes = await fetch('/api/list-sponsors', {
        credentials: 'include' // Include cookies for authentication
      })
      
      if (membersRes.status === 401) {
        // Session expired, redirect to login
        router.push('/admin/login')
        return
      }
      
      const membersData = await membersRes.json()
      
      // Fetch applications
      const appsRes = await fetch('/api/list-applications', {
        credentials: 'include' // Include cookies for authentication
      })
      
      if (appsRes.status === 401) {
        // Session expired, redirect to login
        router.push('/admin/login')
        return
      }
      
      const appsData = await appsRes.json()
      
      // Fetch member spotlight entries
      const spotlightRes = await fetch('/api/admin/member-spotlight', {
        credentials: 'include' // Include cookies for authentication
      })
      
      if (spotlightRes.status === 401) {
        // Session expired, redirect to login
        router.push('/admin/login')
        return
      }
      
      const spotlightData = await spotlightRes.json()
      
      if (membersData.success) {
        setMembers(membersData.sponsors)
      } else {
        console.error('Failed to fetch members:', membersData.message)
        setError('Failed to load member data')
      }
      
      if (appsData.success) {
        setApplications(appsData.applications)
      } else {
        console.error('Failed to fetch applications:', appsData.message)
        setError('Failed to load application data')
      }
      
      if (spotlightData.success) {
        setSpotlightMembers(spotlightData.sponsors)
      } else {
        console.error('Failed to fetch member spotlight:', spotlightData.message)
        setError('Failed to load member spotlight data')
      }
      
    } catch (err) {
      console.error('Data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  // Fetch data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include' // Include cookies for authentication
      })
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      })
    }
  }

  async function addMemberManually() {
    if (!addMemberForm.name.trim() || !addMemberForm.email.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name and email are required.",
        variant: "destructive"
      })
      return
    }

    try {
      setAddingMember(true)
      
      const response = await fetch('/api/admin/members/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(addMemberForm)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Member added",
          description: `${addMemberForm.name} has been added successfully.`,
        })
        
        // Reset form and close dialog
        setAddMemberForm({
          name: '',
          email: '',
          streetAddress: '',
          city: '',
          state: '',
          zip: '',
          professionalQualification: '',
          interest: '',
          contribution: '',
          employer: '',
          linkedin: ''
        })
        setShowAddMemberDialog(false)
        
        // Refresh the data to show new member
        fetchData()
      } else {
        toast({
          title: "Add member failed",
          description: data.message || "Failed to add member.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Add member failed:', error)
      toast({
        title: "Add member failed",
        description: "There was an error adding the member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAddingMember(false)
    }
  }

  async function deleteMember(memberId: string, memberName: string, memberEmail: string) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete member "${memberName}" (${memberEmail})?\n\nThis will also delete all their related applications and cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/members/${memberId}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Member deleted",
          description: `${memberName} has been deleted successfully.`,
        })
        // Refresh the data to show updated list
        fetchData()
      } else {
        toast({
          title: "Delete failed",
          description: data.message || "Failed to delete member.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Delete member failed:', error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the member. Please try again.",
        variant: "destructive"
      })
    }
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-gray-600 border-gray-300"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter applications by status
  const pendingApplications = applications.filter(app => app.status.toLowerCase() === 'pending')

  if (checkingAuth) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-center">
            <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <div className="text-lg">Checking authentication...</div>
          </div>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-center">Loading admin dashboard...</div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Manage members and review applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pending Applications ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="member-spotlight" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Member Spotlight ({spotlightMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card className="border-emerald-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Active Members ({members.length})
                    </CardTitle>
                    <CardDescription>
                      Members who can sponsor new applications with their detailed profiles
                    </CardDescription>
                  </div>
                  <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                          Manually add a new member to the IMAN Professional Network
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-emerald-900">Basic Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name *</Label>
                              <Input
                                id="name"
                                value={addMemberForm.name}
                                onChange={(e) => setAddMemberForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={addMemberForm.email}
                                onChange={(e) => setAddMemberForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter email address"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-emerald-900">Address Information</h3>
                          <div className="space-y-2">
                            <Label htmlFor="streetAddress">Street Address</Label>
                            <Input
                              id="streetAddress"
                              value={addMemberForm.streetAddress}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                              placeholder="Enter street address"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={addMemberForm.city}
                                onChange={(e) => setAddMemberForm(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Enter city"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={addMemberForm.state}
                                onChange={(e) => setAddMemberForm(prev => ({ ...prev, state: e.target.value }))}
                                placeholder="Enter state"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="zip">ZIP Code</Label>
                              <Input
                                id="zip"
                                value={addMemberForm.zip}
                                onChange={(e) => setAddMemberForm(prev => ({ ...prev, zip: e.target.value }))}
                                placeholder="Enter ZIP code"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-emerald-900">Professional Information</h3>
                          <div className="space-y-2">
                            <Label htmlFor="professionalQualification">Professional Qualification</Label>
                            <Textarea
                              id="professionalQualification"
                              value={addMemberForm.professionalQualification}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, professionalQualification: e.target.value }))}
                              placeholder="Describe professional background and qualifications"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employer">Current Employer</Label>
                            <Input
                              id="employer"
                              value={addMemberForm.employer}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, employer: e.target.value }))}
                              placeholder="Enter current employer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn Profile</Label>
                            <Input
                              id="linkedin"
                              type="url"
                              value={addMemberForm.linkedin}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                        </div>

                        {/* IMAN Network Involvement */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-emerald-900">IMAN Network Involvement</h3>
                          <div className="space-y-2">
                            <Label htmlFor="interest">Interest in IMAN</Label>
                            <Textarea
                              id="interest"
                              value={addMemberForm.interest}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, interest: e.target.value }))}
                              placeholder="Describe interest in joining IMAN Professional Network"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contribution">How They Contribute</Label>
                            <Textarea
                              id="contribution"
                              value={addMemberForm.contribution}
                              onChange={(e) => setAddMemberForm(prev => ({ ...prev, contribution: e.target.value }))}
                              placeholder="Describe how they contribute to the network"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddMemberDialog(false)}
                          disabled={addingMember}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={addMemberManually}
                          disabled={addingMember}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {addingMember ? "Adding..." : "Add Member"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {members.map((member) => (
                    <div key={member.id} className="p-6 bg-emerald-50 rounded-lg border border-emerald-100 space-y-4">
                      {/* Header with name and status */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-xl text-emerald-900">{member.name}</h3>
                          <p className="text-emerald-700">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.active ? "default" : "secondary"}>
                            {member.active ? "Active" : "Inactive"}
                          </Badge>
                          <Link href={`/admin/members/${member.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              title={`Edit ${member.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMember(member.id, member.name, member.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            title={`Delete ${member.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-emerald-200" />

                      {/* Member details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Contact & Location */}
                        {member.streetAddress && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-emerald-800">Address</p>
                            <div className="text-sm text-emerald-700">
                              <p>{member.streetAddress}</p>
                              <p>{member.city}, {member.state} {member.zip}</p>
                            </div>
                          </div>
                        )}

                        {/* Professional Info */}
                        {member.professionalQualification && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-emerald-800">Professional Qualification</p>
                            <p className="text-sm text-emerald-700">{member.professionalQualification}</p>
                          </div>
                        )}

                        {member.employer && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-emerald-800">Employer</p>
                            <p className="text-sm text-emerald-700">{member.employer}</p>
                          </div>
                        )}

                        {/* LinkedIn */}
                        {member.linkedin && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-emerald-800">LinkedIn</p>
                            <a 
                              href={member.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="w-3 h-3" />
                              View Profile
                            </a>
                          </div>
                        )}

                        {/* Member Stats */}
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-emerald-800">Approvals This Period</p>
                          <p className="text-sm text-emerald-700">{member.approvalsInWindow}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-emerald-800">Member Since</p>
                          <p className="text-sm text-emerald-700">
                            {formatDate(member.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Interest and Contribution - Full width */}
                      {(member.interest || member.contribution) && (
                        <>
                          <Separator className="bg-emerald-200" />
                          <div className="space-y-4">
                            {member.interest && (
                              <div>
                                <p className="text-sm font-medium text-emerald-800 mb-2">Interest in IMAN</p>
                                <div className="bg-white p-3 rounded border border-emerald-200">
                                  <p className="text-sm text-emerald-700">{member.interest}</p>
                                </div>
                              </div>
                            )}

                            {member.contribution && (
                              <div>
                                <p className="text-sm font-medium text-emerald-800 mb-2">How They Contribute</p>
                                <div className="bg-white p-3 rounded border border-emerald-200">
                                  <p className="text-sm text-emerald-700">{member.contribution}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Footer with ID and dates */}
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                        <div className="text-xs text-emerald-600">
                          Member ID: {member.id}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {member.lastApprovalAt && (
                            <>Last approval: {formatDate(member.lastApprovalAt)}</>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No members found</p>
                      <p className="text-sm text-muted-foreground">Members will appear here once applications are approved</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Pending Applications ({pendingApplications.length})
                </CardTitle>
                <CardDescription>
                  Applications awaiting review and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg space-y-3 bg-amber-50/30 border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-lg">{app.applicantName}</p>
                          <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(app.status)}
                          <Link href={`/admin/application/${app.token}`}>
                            <Button size="sm" variant="outline" className="hover:border-emerald-500 hover:text-emerald-600">
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Sponsor</p>
                          <p>{app.sponsorEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Location</p>
                          <p>{app.city}, {app.state}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Submitted</p>
                          <p>{formatDate(app.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Expires</p>
                          <p className={new Date(app.expiresAt) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {formatDate(app.expiresAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground font-medium">Professional Qualification</p>
                        <p className="truncate">{app.professionalQualification}</p>
                      </div>
                      
                      {app.employer && (
                        <div className="text-sm">
                          <p className="text-muted-foreground font-medium">Employer</p>
                          <p>{app.employer}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Token: {app.token}
                      </div>
                    </div>
                  ))}
                  {pendingApplications.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No pending applications</p>
                      <p className="text-sm text-muted-foreground">All applications have been processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Applications Summary */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">All Applications Summary</CardTitle>
                <CardDescription>
                  Overview of all applications by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-2xl font-bold text-amber-600">
                      {applications.filter(app => app.status.toLowerCase() === 'pending').length}
                    </p>
                    <p className="text-sm text-amber-700">Pending</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status.toLowerCase() === 'approved').length}
                    </p>
                    <p className="text-sm text-green-700">Approved</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter(app => app.status.toLowerCase() === 'rejected').length}
                    </p>
                    <p className="text-sm text-red-700">Rejected</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold text-gray-600">
                      {applications.filter(app => app.status.toLowerCase() === 'expired').length}
                    </p>
                    <p className="text-sm text-gray-700">Expired</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="member-spotlight" className="space-y-4">
            <MemberSpotlightTab members={spotlightMembers} onRefresh={fetchData} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </section>
    </main>
  )
}
