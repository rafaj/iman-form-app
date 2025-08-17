import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { approveApplication, expireOldApplications, findMemberByEmail, getApplicationByToken } from "@/lib/database"
import { sendActivationEmail } from "@/lib/email"
import { ApplicationStatus } from "@prisma/client"
import { prisma } from "@/lib/database"
import { randomBytes } from "crypto"

const ApproveSchema = z.object({
  memberEmail: z.string().email().max(200),
  memberId: z.string().min(3).max(50),
  verificationCode: z
    .string()
    .length(6)
    .regex(/^[0-9]+$/),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    await expireOldApplications()
    const { token } = await params
    const payload = ApproveSchema.parse(await req.json())

    const app = await getApplicationByToken(token)
    if (!app) {
      return NextResponse.json({ message: "Unknown or invalid approval link." }, { status: 404 })
    }
    if (app.status !== ApplicationStatus.PENDING) {
      return NextResponse.json({ message: "This application is not pending." }, { status: 400 })
    }

    // Verify sponsor identity
    const member = await findMemberByEmail(payload.memberEmail)
    if (!member || !member.active || member.id !== payload.memberId) {
      return NextResponse.json({ message: "Member verification failed." }, { status: 401 })
    }

    // The sponsor must match the application
    if (payload.memberEmail.toLowerCase() !== app.sponsorEmail.toLowerCase()) {
      return NextResponse.json({ message: "You are not the sponsor for this application." }, { status: 403 })
    }

    // Prevent self-approval
    if (payload.memberEmail.toLowerCase() === app.applicantEmail.toLowerCase()) {
      return NextResponse.json({ message: "Sponsors cannot approve their own application." }, { status: 400 })
    }

    // Validate verification code and rate-limits, then approve
    const ok = await approveApplication({
      token,
      memberId: payload.memberId,
      verificationCode: payload.verificationCode,
    })

    if (!ok.ok) {
      return NextResponse.json({ message: ok.message }, { status: ok.status })
    }

    // Generate activation token for account creation
    const activationToken = randomBytes(32).toString('hex')
    
    try {
      // Update application with activation token
      await prisma.application.update({
        where: { token },
        data: { activationToken }
      })

      // Send activation email
      await sendActivationEmail({
        to: app.applicantEmail,
        applicantName: app.applicantName,
        activationToken
      })
      
      console.log(`Activation email sent to ${app.applicantEmail}`)
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({ message: "Application approved and activation email sent." })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === "ZodError") {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 })
    }
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 })
  }
}
