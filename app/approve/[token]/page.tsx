"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
// Define ApplicationStatus enum locally to avoid importing @prisma/client on client-side
enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED", 
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED"
}

type Application = {
  applicantName: string
  applicantEmail: string
  sponsorEmail: string
  status: string
  createdAt: string
}

function formatStatus(status: ApplicationStatus | string | undefined): string {
  if (!status) return 'unknown'
  return String(status).toLowerCase()
}

export default function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [app, setApp] = useState<Application | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { token: resolvedToken } = await params
        setToken(resolvedToken)
        const res = await fetch(`/api/applications/${resolvedToken}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.message || "Application not found")
        }
        const data = await res.json()
        if (data.success && data.application) {
          if (active) setApp(data.application)
        } else {
          throw new Error(data.message || "Application not found")
        }
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [params])

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-xl px-4 py-10">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Approve membership</CardTitle>
                <CardDescription>{"Sponsors verify and approve here."}</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                {"Verified members only"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {error && (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>{"Invalid link"}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {app && (
              <>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <div className="mt-1 text-sm">
                    <p className="font-medium text-foreground">{app.applicantName}</p>
                    <p className="text-muted-foreground">{app.applicantEmail}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-muted px-2 py-1">
                      <span className="text-muted-foreground">Sponsor:</span>{" "}
                      <span className="text-foreground">{app.sponsorEmail}</span>
                    </div>
                    <div className="rounded bg-muted px-2 py-1">
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <span className="text-foreground capitalize">{formatStatus(app.status)}</span>
                    </div>
                  </div>
                </div>
                <ApproveForm token={token} disabled={app.status !== 'pending'} />
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function ApproveForm({ token, disabled }: { token: string; disabled: boolean }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (disabled) return
    const fd = new FormData(e.currentTarget)
    const memberEmail = String(fd.get("memberEmail") || "").trim()
    const memberId = String(fd.get("memberId") || "").trim()
    const verificationCode = String(fd.get("verificationCode") || "").trim()
    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberEmail, memberId, verificationCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Approval failed")
      }
      toast({ title: "Approved", description: "Membership application approved." })
      router.refresh()
    } catch (err: unknown) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'An error occurred', 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "focus-visible:ring-emerald-500"

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="memberEmail">Your member email</Label>
        <Input
          id="memberEmail"
          name="memberEmail"
          type="email"
          placeholder="member@iman.org"
          required
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="memberId">Your member ID</Label>
        <Input
          id="memberId"
          name="memberId"
          placeholder="e.g. MBR-1024"
          required
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="verificationCode">Verification code</Label>
        <Input
          id="verificationCode"
          name="verificationCode"
          placeholder="6-digit code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          disabled={disabled}
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          This verification code is sent to the sponsor via email.
        </p>
      </div>
      <Button
        type="submit"
        disabled={disabled || loading}
        className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
      >
        {loading ? "Verifying..." : "Verify and approve"}
      </Button>
      {disabled && <AlertSuccess />}
    </form>
  )
}

function AlertSuccess() {
  return (
    <Alert>
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>{"Already processed"}</AlertTitle>
      <AlertDescription>{"This application is no longer pending."}</AlertDescription>
    </Alert>
  )
}
