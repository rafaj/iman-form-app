"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  Mail,
  MapPin,
  Building,
  Linkedin,
  FileText,
  Calendar,
  Shield
} from "lucide-react"
import Link from "next/link"

type ApplicationDetail = {
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
  verificationCode?: string
}

export default function ApplicationReviewPage() {
  const params = useParams()
  const { toast } = useToast()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  const token = params.token as string

  // Fetch application data with proper useCallback ordering
  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${token}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setApplication(data.application)
      } else {
        setError(data.message || 'Failed to fetch application')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchApplication()
    }
  }, [token, fetchApplication])

  async function handleApprove() {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Required",
        description: "Please enter the verification code to approve this application.",
        variant: "destructive"
      })
      return
    }

    try {
      setApproving(true)
      const response = await fetch(`/api/admin/applications/${token}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationCode: verificationCode.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Application Approved! ✅",
          description: "The applicant has been successfully approved and notified.",
        })
        // Refresh the application data
        await fetchApplication()
        setVerificationCode("")
      } else {
        toast({
          title: "Approval Failed",
          description: data.message || "Failed to approve application. Please check the verification code.",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred while approving.",
        variant: "destructive"
      })
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    try {
      setRejecting(true)
      const response = await fetch(`/api/admin/applications/${token}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Application Rejected",
          description: "The application has been rejected and the applicant has been notified.",
        })
        // Refresh the application data
        await fetchApplication()
      } else {
        toast({
          title: "Rejection Failed",
          description: data.message || "Failed to reject application.",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred while rejecting.",
        variant: "destructive"
      })
    } finally {
      setRejecting(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="text-center">Loading application details...</div>
        </section>
      </main>
    )
  }

  if (error || !application) {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="text-center">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error || 'Application not found'}
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Admin Dashboard</Button>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const isPending = application.status.toLowerCase() === 'pending'
  const isExpired = new Date(application.expiresAt) < new Date()

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            {getStatusBadge(application.status)}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Application Review</h1>
          <p className="mt-2 text-muted-foreground">
            Detailed review for {application.applicantName}&apos;s membership application
          </p>
        </header>

        <div className="space-y-6">
          {/* Applicant Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-medium">{application.applicantName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p>{application.applicantEmail}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{application.streetAddress}</p>
                <p>{application.city}, {application.state} {application.zip}</p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Professional Qualification</Label>
                <p className="mt-1">{application.professionalQualification}</p>
              </div>
              {application.employer && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Employer</Label>
                  <p className="mt-1">{application.employer}</p>
                </div>
              )}
              {application.linkedin && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">LinkedIn Profile</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <a 
                      href={application.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {application.linkedin}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Interest in Joining</Label>
                <Textarea 
                  value={application.interest} 
                  readOnly 
                  className="mt-1 min-h-[100px] resize-none"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">How They Can Contribute</Label>
                <Textarea 
                  value={application.contribution} 
                  readOnly 
                  className="mt-1 min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sponsor & Timeline Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Sponsor & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sponsor Email</Label>
                  <p className="mt-1">{application.sponsorEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Token</Label>
                  <p className="mt-1 font-mono text-sm">{application.token}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                  <p className="mt-1">{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expires</Label>
                  <p className={`mt-1 ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(application.expiresAt)}
                    {isExpired && ' (Expired)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Panel - Only show for pending applications */}
          {isPending && !isExpired && (
            <Card className="border-emerald-100 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Review Actions
                </CardTitle>
                <CardDescription>
                  Review the application details above and take action below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verificationCode">Verification Code (Required for Approval)</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter verification code from email"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The verification code was sent to the sponsor&apos;s email when this application was submitted.
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={approving || !verificationCode.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Application
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleReject}
                    disabled={rejecting}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {rejecting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {!isPending && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>This application has already been {application.status.toLowerCase()}.</p>
                  <p className="text-sm mt-1">No further action is required.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isPending && isExpired && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center text-red-800">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">This application has expired.</p>
                  <p className="text-sm mt-1">Applications expire after 7 days if not reviewed.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
