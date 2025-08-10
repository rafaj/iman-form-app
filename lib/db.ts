import { randomBytes, randomUUID } from "crypto"

// Types
export type Member = {
  id: string
  name: string
  email: string
  active: boolean
  approvalsInWindow: number
  lastApprovalAt?: number
}

export type Application = {
  id: string
  token: string
  applicantName: string
  applicantEmail: string
  sponsorEmail: string
  sponsorMemberId: string

  // New applicant fields
  streetAddress: string
  city: string
  state: string
  zip: string
  professionalQualification: string
  interest: string
  contribution: string
  employer?: string
  linkedin?: string

  status: "pending" | "approved" | "rejected" | "expired"
  createdAt: string
  expiresAt: number
  approvedAt?: string
  verificationCode: string // 6-digit
  audit: Array<{ at: string; event: string; by?: string; meta?: Record<string, any> }>
}

type CreateInput = {
  applicantName: string
  applicantEmail: string
  sponsorEmail: string
  sponsorMemberId: string

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

type ApproveInput = {
  token: string
  memberId: string
  verificationCode: string
}

// Simple in-memory DB with module-scoped state (persists while app runs)
type DB = {
  members: Member[]
  applications: Application[]
  rateLimit: {
    windowMs: number
    maxApprovalsPerMember: number
  }
}

const globalForDb = globalThis as unknown as { __clubDemoDb?: DB }
export const db: DB =
  globalForDb.__clubDemoDb ??
  (globalForDb.__clubDemoDb = {
    members: seedMembers(),
    applications: [],
    rateLimit: {
      windowMs: 1000 * 60 * 60 * 24 * 30, // 30 days
      maxApprovalsPerMember: 5, // Demo rate limit
    },
  })

export function findMemberByEmail(email: string) {
  return db.members.find((m) => m.email.toLowerCase() === email.toLowerCase())
}

export function createApplication(input: CreateInput): Application {
  // Single active pending application per applicant and sponsor to avoid spam
  const existing = db.applications.find(
    (a) =>
      a.applicantEmail.toLowerCase() === input.applicantEmail.toLowerCase() &&
      a.sponsorEmail.toLowerCase() === input.sponsorEmail.toLowerCase() &&
      a.status === "pending",
  )
  if (existing) {
    return existing
  }

  const app: Application = {
    id: randomUUID(),
    token: base64url(randomBytes(16)),
    applicantName: input.applicantName,
    applicantEmail: input.applicantEmail,
    sponsorEmail: input.sponsorEmail,
    sponsorMemberId: input.sponsorMemberId,

    streetAddress: input.streetAddress,
    city: input.city,
    state: input.state,
    zip: input.zip,
    professionalQualification: input.professionalQualification,
    interest: input.interest,
    contribution: input.contribution,
    employer: input.employer,
    linkedin: input.linkedin,

    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    verificationCode: generateCode(),
    audit: [{ at: new Date().toISOString(), event: "created" }],
  }
  db.applications.push(app)
  return app
}

export function getApplicationByToken(token: string) {
  const app = db.applications.find((a) => a.token === token)
  if (!app) return null
  // Auto-expire on read
  if (app.status === "pending" && Date.now() > app.expiresAt) {
    app.status = "expired"
    app.audit.push({ at: new Date().toISOString(), event: "expired" })
  }
  return app
}

export function approveApplication(input: ApproveInput): { ok: boolean; message?: string; status?: number } {
  const app = getApplicationByToken(input.token)
  if (!app) return { ok: false, message: "Unknown application.", status: 404 }
  if (app.status !== "pending") return { ok: false, message: "Application is not pending.", status: 400 }
  if (Date.now() > app.expiresAt) {
    app.status = "expired"
    app.audit.push({ at: new Date().toISOString(), event: "expired" })
    return { ok: false, message: "Approval link expired.", status: 410 }
  }
  if (input.verificationCode !== app.verificationCode) {
    return { ok: false, message: "Incorrect verification code.", status: 401 }
  }

  // Rate limiting per member
  const sponsor = db.members.find((m) => m.id === input.memberId)
  if (!sponsor) return { ok: false, message: "Member not found.", status: 404 }

  const now = Date.now()
  const withinWindow = sponsor.lastApprovalAt && now - sponsor.lastApprovalAt < db.rateLimit.windowMs
  if (!withinWindow) {
    sponsor.approvalsInWindow = 0
  }
  if (sponsor.approvalsInWindow >= db.rateLimit.maxApprovalsPerMember) {
    return { ok: false, message: "Approval rate limit exceeded for this member.", status: 429 }
  }

  sponsor.approvalsInWindow += 1
  sponsor.lastApprovalAt = now

  app.status = "approved"
  app.approvedAt = new Date().toISOString()
  app.audit.push({ at: app.approvedAt, event: "approved", by: sponsor.id })

  // Invalidate token by rotating it (defense-in-depth)
  app.token = "USED-" + app.token

  return { ok: true }
}

export function expireOldApplications() {
  const now = Date.now()
  for (const a of db.applications) {
    if (a.status === "pending" && now > a.expiresAt) {
      a.status = "expired"
      a.audit.push({ at: new Date().toISOString(), event: "expired" })
    }
  }
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  const maskedUser =
    user.length <= 2 ? "*".repeat(user.length) : user[0] + "*".repeat(user.length - 2) + user[user.length - 1]
  const [d1, d2] = domain.split(".")
  const maskedDomain = (d1.length <= 2 ? "*".repeat(d1.length) : d1[0] + "*".repeat(d1.length - 1)) + "." + (d2 || "")
  return maskedUser + "@" + maskedDomain
}

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function generateCode() {
  // 6-digit numeric
  const n = Math.floor(Math.random() * 900000) + 100000
  return String(n)
}

function seedMembers(): Member[] {
  // Demo member directory. Replace with your real member database.
  return [
    { id: "MBR-1001", name: "Jamie Rivera", email: "jamie@iman.org", active: true, approvalsInWindow: 0 },
    { id: "MBR-1002", name: "Taylor Kim", email: "taylor@iman.org", active: true, approvalsInWindow: 0 },
    { id: "MBR-1003", name: "Morgan Patel", email: "morgan@iman.org", active: false, approvalsInWindow: 0 }, // inactive
    { id: "MBR-2001", name: "Jafar", email: "jafar@jafar.com", active: true, approvalsInWindow: 0 }, // added
  ]
}
