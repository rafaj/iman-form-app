import { PrismaClient, ApplicationStatus, Member, Application } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Types for API
export type CreateApplicationInput = {
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

export type ApproveApplicationInput = {
  token: string
  memberId: string
  verificationCode: string
}

// Database functions
export async function findMemberByEmail(email: string): Promise<Member | null> {
  return await prisma.member.findUnique({
    where: {
      email: email.toLowerCase()
    }
  })
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  // Check for existing pending application
  const existing = await prisma.application.findFirst({
    where: {
      applicantEmail: {
        equals: input.applicantEmail,
        mode: 'insensitive'
      },
      sponsorEmail: {
        equals: input.sponsorEmail,
        mode: 'insensitive'
      },
      status: ApplicationStatus.PENDING
    }
  })

  if (existing) {
    return existing
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const application = await prisma.application.create({
    data: {
      token: generateToken(),
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
      expiresAt,
      verificationCode: generateCode(),
      auditLogs: {
        create: {
          event: 'created'
        }
      }
    },
    include: {
      auditLogs: true
    }
  })

  return application
}

export async function getApplicationByToken(token: string): Promise<Application | null> {
  const app = await prisma.application.findUnique({
    where: { token },
    include: {
      auditLogs: true,
      sponsor: true
    }
  })

  if (!app) return null

  // Auto-expire if needed
  if (app.status === ApplicationStatus.PENDING && new Date() > app.expiresAt) {
    const updatedApp = await prisma.application.update({
      where: { id: app.id },
      data: {
        status: ApplicationStatus.EXPIRED,
        auditLogs: {
          create: {
            event: 'expired'
          }
        }
      },
      include: {
        auditLogs: true,
        sponsor: true
      }
    })
    return updatedApp
  }

  return app
}

export async function approveApplication(input: ApproveApplicationInput): Promise<{ ok: boolean; message?: string; status?: number }> {
  const app = await getApplicationByToken(input.token)
  
  if (!app) return { ok: false, message: "Unknown application.", status: 404 }
  if (app.status !== ApplicationStatus.PENDING) return { ok: false, message: "Application is not pending.", status: 400 }
  if (new Date() > app.expiresAt) {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: ApplicationStatus.EXPIRED,
        auditLogs: {
          create: {
            event: 'expired'
          }
        }
      }
    })
    return { ok: false, message: "Approval link expired.", status: 410 }
  }
  if (input.verificationCode !== app.verificationCode) {
    return { ok: false, message: "Incorrect verification code.", status: 401 }
  }

  // Get sponsor for rate limiting
  const sponsor = await prisma.member.findUnique({
    where: { id: input.memberId }
  })

  if (!sponsor) return { ok: false, message: "Member not found.", status: 404 }

  // Rate limiting logic
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  const withinWindow = sponsor.lastApprovalAt && sponsor.lastApprovalAt > thirtyDaysAgo

  if (!withinWindow) {
    await prisma.member.update({
      where: { id: sponsor.id },
      data: { approvalsInWindow: 0 }
    })
  }

  if (sponsor.approvalsInWindow >= 5) { // Demo rate limit
    return { ok: false, message: "Approval rate limit exceeded for this member.", status: 429 }
  }

  // Update member approval count
  await prisma.member.update({
    where: { id: sponsor.id },
    data: {
      approvalsInWindow: { increment: 1 },
      lastApprovalAt: now
    }
  })

  // Approve the application
  await prisma.application.update({
    where: { id: app.id },
    data: {
      status: ApplicationStatus.APPROVED,
      approvedAt: now,
      approvedById: sponsor.id,
      token: "USED-" + app.token, // Invalidate token
      auditLogs: {
        create: {
          event: 'approved',
          performedBy: sponsor.id
        }
      }
    }
  })

  return { ok: true }
}

export async function expireOldApplications(): Promise<void> {
  const now = new Date()
  
  await prisma.application.updateMany({
    where: {
      status: ApplicationStatus.PENDING,
      expiresAt: {
        lt: now
      }
    },
    data: {
      status: ApplicationStatus.EXPIRED
    }
  })

  // Add audit logs for expired applications
  const expiredApplications = await prisma.application.findMany({
    where: {
      status: ApplicationStatus.EXPIRED,
      auditLogs: {
        none: {
          event: 'expired'
        }
      }
    }
  })

  for (const app of expiredApplications) {
    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        event: 'expired'
      }
    })
  }
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  const maskedUser =
    user.length <= 2 ? "*".repeat(user.length) : user[0] + "*".repeat(user.length - 2) + user[user.length - 1]
  const [d1, d2] = domain.split(".")
  const maskedDomain = (d1.length <= 2 ? "*".repeat(d1.length) : d1[0] + "*".repeat(d1.length - 1)) + "." + (d2 || "")
  return maskedUser + "@" + maskedDomain
}

// Utility functions
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}

function generateCode(): string {
  const n = Math.floor(Math.random() * 900000) + 100000
  return String(n)
}

// Seed function for initial data
export async function seedDatabase(): Promise<void> {
  const members = [
    { id: "MBR-1001", name: "Jamie Rivera", email: "jamie@iman.org", active: true },
    { id: "MBR-1002", name: "Taylor Kim", email: "taylor@iman.org", active: true },
    { id: "MBR-1003", name: "Morgan Patel", email: "morgan@iman.org", active: false },
    { id: "MBR-2001", name: "Jafar", email: "jafar@jafar.com", active: true },
  ]

  for (const member of members) {
    await prisma.member.upsert({
      where: { email: member.email },
      update: {},
      create: member
    })
  }
}
