"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import MobileNavigation from "@/components/mobile-navigation"

export default function HomePage() {
  const { data: session } = useSession()
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
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

    if (session?.user?.email) {
      checkMemberStatus()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                <p className="text-xs md:text-sm text-emerald-600">Membership Application</p>
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
                      <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Events</Link>
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
                  <Link href="/apply" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Apply</Link>
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Member Sign In
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <MobileNavigation session={session} isMember={isMember} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">Join IMAN Professional Network</h1>
          <p className="mt-2 text-muted-foreground">
            A sponsor-approved application to join IMAN&apos;s community of professionals.
          </p>
        </header>

        {/* Primary apply card */}
        <div className="grid grid-cols-1">
          <ApplyCard />
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
                    <li><Link href="/events" className="hover:text-white">Events</Link></li>
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

function ApplyCard() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      applicantName: String(formData.get("applicantName") || "").trim(),
      applicantEmail: String(formData.get("applicantEmail") || "").trim(),
      sponsorEmail: String(formData.get("sponsorEmail") || "").trim(),
      streetAddress: String(formData.get("streetAddress") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      zip: String(formData.get("zip") || "").trim(),
      professionalQualification: String(formData.get("professionalQualification") || "").trim(),
      interest: String(formData.get("interest") || "").trim(),
      contribution: String(formData.get("contribution") || "").trim(),
      employer: String(formData.get("employer") || "").trim(),
      linkedin: String(formData.get("linkedin") || "").trim(),
      // Mentorship fields
      availableAsMentor: Boolean(formData.get("availableAsMentor")),
      mentorProfile: String(formData.get("mentorProfile") || "").trim(),
      seekingMentor: Boolean(formData.get("seekingMentor")),
      menteeProfile: String(formData.get("menteeProfile") || "").trim(),
    }

    // Remove optional empties so zod optional passes cleanly
    if (!payload.employer) delete (payload as Record<string, unknown>).employer
    if (!payload.linkedin) delete (payload as Record<string, unknown>).linkedin
    if (!payload.mentorProfile) delete (payload as Record<string, unknown>).mentorProfile
    if (!payload.menteeProfile) delete (payload as Record<string, unknown>).menteeProfile

    setServerError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "Failed to create application")
      }
      
      // Show success toast
      toast({ 
        title: "Application submitted successfully!", 
        description: "Redirecting to confirmation page..." 
      })
      
      // Redirect to thank you page
      router.push("/thank-you")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      setServerError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "focus-visible:ring-emerald-500"

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader>
        <CardTitle>Apply for membership</CardTitle>
        <CardDescription>
          Takes a few minutes. Your sponsor must be an existing member.
          <br />
          <strong>Note:</strong> You&apos;ll need a Google account to sign in after approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="applicantName">Full name</Label>
            <Input 
              id="applicantName" 
              name="applicantName" 
              placeholder="Alex Doe" 
              defaultValue={session?.user?.name || ""}
              required 
              className={inputClass} 
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicantEmail">Your email</Label>
              <Input
                id="applicantEmail"
                name="applicantEmail"
                type="email"
                placeholder="you@example.com"
                defaultValue={session?.user?.email || ""}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsorEmail">Sponsor&apos;s email</Label>
              <Input
                id="sponsorEmail"
                name="sponsorEmail"
                type="email"
                placeholder="member@iman.org"
                required
                className={inputClass}
              />
            </div>
          </div>

          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Address</p>
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                name="streetAddress"
                placeholder="123 Main St, Apt 4B"
                required
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Chicago" required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="IL" required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" name="zip" placeholder="60601" inputMode="numeric" required className={inputClass} />
              </div>
            </div>
          </div>

          <Separator />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="professionalQualification">Professional Qualification</Label>
              <Input
                id="professionalQualification"
                name="professionalQualification"
                placeholder="e.g., MBA, PE, CPA, MD, JD"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employer">Employer (Optional)</Label>
              <Input id="employer" name="employer" placeholder="Your employer or organization" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://www.linkedin.com/in/username"
                className={inputClass}
              />
            </div>
          </div>

          <Separator />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="interest">Please state your interest in joining IMAN Professional Network</Label>
              <Textarea
                id="interest"
                name="interest"
                placeholder="Why do you want to join? What do you hope to gain and learn?"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribution">
                How can you contribute to help develop IMAN Professional Network as a community asset that can help all?
              </Label>
              <Textarea
                id="contribution"
                name="contribution"
                placeholder="Share concrete ways you can contribute (skills, time, mentorship, partnerships, etc.)"
                required
                className={inputClass}
              />
            </div>
          </div>

          <Separator />
          
          {/* Mentorship Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">Professional Development (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                IMAN connects members for mentorship and professional growth. Help us match you with the right opportunities.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="availableAsMentor"
                    name="availableAsMentor"
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="availableAsMentor" className="text-sm font-medium">
                    I&apos;m interested in being a mentor
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  <Label htmlFor="mentorProfile" className="text-sm">
                    What areas can you mentor in? (e.g., &quot;Data Science, Career Transitions, Leadership&quot;)
                  </Label>
                  <Textarea
                    id="mentorProfile"
                    name="mentorProfile"
                    placeholder="Share your expertise and what you'd enjoy mentoring others in..."
                    className={inputClass}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="seekingMentor"
                    name="seekingMentor"
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="seekingMentor" className="text-sm font-medium">
                    I&apos;m seeking mentorship
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  <Label htmlFor="menteeProfile" className="text-sm">
                    What would you like guidance on? (e.g., &quot;Breaking into Tech, MBA Applications, Entrepreneurship&quot;)
                  </Label>
                  <Textarea
                    id="menteeProfile"
                    name="menteeProfile"
                    placeholder="Share what you'd like to learn or get guidance on..."
                    className={inputClass}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              {loading ? "Submitting..." : "Submit application"}
            </Button>
            <p className="text-xs text-muted-foreground">{"We'll notify your sponsor."}</p>
          </div>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

