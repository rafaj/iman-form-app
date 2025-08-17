"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Join IMAN Professional Network</h1>
          <p className="mt-2 text-muted-foreground">
            A sponsor-approved application to join IMAN’s community of professionals.
          </p>
        </header>

        {/* Primary apply card */}
        <div className="grid grid-cols-1">
          <ApplyCard />
        </div>
      </section>

    </main>
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
    }

    // Remove optional empties so zod optional passes cleanly
    if (!payload.employer) delete (payload as Record<string, unknown>).employer
    if (!payload.linkedin) delete (payload as Record<string, unknown>).linkedin

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

