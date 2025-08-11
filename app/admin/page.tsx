"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

type Member = {
  id: string
  name: string
  email: string
  active: boolean
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

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch members
      const membersRes = await fetch('/api/list-sponsors')
      const membersData = await membersRes.json()
      
      // Fetch applications
      const appsRes = await fetch('/api/list-applications')
      const appsData = await appsRes.json()
      
      if (membersData.success) {
        setMembers(membersData.sponsors)
      }
      
      if (appsData.success) {
        setApplications(appsData.applications)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
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
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Members ({members.length})
              </CardTitle>
              <CardDescription>
                Active members who can sponsor new applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">ID: {member.id}</p>
                    </div>
                    <Badge variant={member.active ? "default" : "secondary"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No members found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications Section */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Applications ({applications.length})
              </CardTitle>
              <CardDescription>
                Recent membership applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.applicantName}</p>
                        <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sponsor</p>
                        <p>{app.sponsorEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{app.city}, {app.state}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{formatDate(app.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p>{formatDate(app.expiresAt)}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-muted-foreground">Professional Qualification</p>
                      <p className="truncate">{app.professionalQualification}</p>
                    </div>
                    
                    {app.employer && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Employer</p>
                        <p>{app.employer}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Token: {app.token}
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No applications found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </section>
    </main>
  )
}
