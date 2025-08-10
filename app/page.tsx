"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CreateResponse = {
  token: string
  approvalLink: string
  // Demo-only: in production, this would be emailed to the sponsor
  demoVerificationCode: string
}

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

      {/* Move How it works to the bottom */}
      <section className="border-t bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <HowItWorksCard />
        </div>
      </section>
    </main>
  )
}

function ApplyCard() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CreateResponse | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const { toast } = useToast()

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
    if (!payload.employer) delete (payload as any).employer
    if (!payload.linkedin) delete (payload as any).linkedin

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
      const data = (await res.json()) as CreateResponse
      setResult(data)
      toast({ title: "Application submitted", description: "Awaiting sponsor approval." })
      form.reset()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "focus-visible:ring-emerald-500"

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader>
        <CardTitle>Apply for membership</CardTitle>
        <CardDescription>{"Takes a few minutes. Your sponsor must be an existing member."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="applicantName">Full name</Label>
            <Input id="applicantName" name="applicantName" placeholder="Alex Doe" required className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicantEmail">Your email</Label>
              <Input
                id="applicantEmail"
                name="applicantEmail"
                type="email"
                placeholder="you@example.com"
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
              <p className="text-xs text-muted-foreground">
                Demo sponsors: jamie@iman.org (MBR-1001), taylor@iman.org (MBR-1002), jafar@jafar.com (MBR-2001)
              </p>
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

        {result && <ApprovalShare result={result} />}
      </CardContent>
    </Card>
  )
}

function ApprovalShare({ result }: { result: CreateResponse }) {
  const { toast } = useToast()

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Link copied to clipboard" })
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <p className="font-medium">Application created</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {"We sent your sponsor an approval link. For this demo, share the link below with them."}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Input readOnly value={result.approvalLink} className="focus-visible:ring-emerald-500" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => copy(result.approvalLink)}
          aria-label="Copy approval link"
          className="hover:border-emerald-500"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          asChild
          className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          aria-label="Open approval link in a new tab"
        >
          <a href={result.approvalLink} target="_blank" rel="noopener noreferrer">
            Open link
          </a>
        </Button>
      </div>
      <Separator className="my-3" />
      <div className="space-y-1">
        <p className="text-sm">Demo verification code (would be emailed to sponsor):</p>
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 text-sm">{result.demoVerificationCode}</code>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result.demoVerificationCode)}>
            Copy code
          </Button>
        </div>
      </div>
    </div>
  )
}

function HowItWorksCard() {
  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader>
        <CardTitle>{"How it works"}</CardTitle>
        <CardDescription>{"Fast for applicants, safe for the network."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-2 pl-5">
          <li>{"You apply with your details and your sponsor’s email (existing member)."}</li>
          <li>{"We create a one-time approval link and verification code for your sponsor."}</li>
          <li>{"Your sponsor verifies themselves and approves in one click."}</li>
        </ol>
        <Separator />
        <div className="space-y-2">
          <p className="font-medium text-foreground">Built-in safeguards</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>{"Single-use, expiring approval links (7 days)"}</li>
            <li>{"Sponsor must be an active member; no self-approval"}</li>
            <li>{"Verification code required to approve"}</li>
            <li>{"Rate-limits per sponsor; audit trail of approvals"}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
