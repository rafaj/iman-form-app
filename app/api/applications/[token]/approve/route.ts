import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { approveApplication, expireOldApplications, findMemberByEmail, getApplicationByToken } from "@/lib/db"

const ApproveSchema = z.object({
  memberEmail: z.string().email().max(200),
  memberId: z.string().min(3).max(50),
  verificationCode: z
    .string()
    .length(6)
    .regex(/^[0-9]+$/),
})

export async function POST(req: NextRequest, ctx: { params: { token: string } }) {
  try {
    expireOldApplications()
    const token = ctx.params.token
    const payload = ApproveSchema.parse(await req.json())

    const app = getApplicationByToken(token)
    if (!app) {
      return NextResponse.json({ message: "Unknown or invalid approval link." }, { status: 404 })
    }
    if (app.status !== "pending") {
      return NextResponse.json({ message: "This application is not pending." }, { status: 400 })
    }

    // Verify sponsor identity
    const member = findMemberByEmail(payload.memberEmail)
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
    const ok = approveApplication({
      token,
      memberId: payload.memberId,
      verificationCode: payload.verificationCode,
    })

    if (!ok.ok) {
      return NextResponse.json({ message: ok.message }, { status: ok.status })
    }

    return NextResponse.json({ message: "Application approved." })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 })
    }
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 })
  }
}
