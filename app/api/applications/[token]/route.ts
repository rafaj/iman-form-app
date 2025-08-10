import { type NextRequest, NextResponse } from "next/server"
import { getApplicationByToken, maskEmail, expireOldApplications } from "@/lib/db"

export async function GET(_req: NextRequest, ctx: { params: { token: string } }) {
  try {
    expireOldApplications()
    const token = ctx.params.token
    const app = getApplicationByToken(token)
    if (!app) {
      return NextResponse.json({ message: "Unknown or invalid approval link." }, { status: 404 })
    }
    if (app.status === "expired") {
      return NextResponse.json({ message: "This approval link has expired." }, { status: 410 })
    }
    return NextResponse.json({
      applicantName: app.applicantName,
      applicantEmailMasked: maskEmail(app.applicantEmail),
      sponsorEmailMasked: maskEmail(app.sponsorEmail),
      status: app.status,
      createdAt: app.createdAt,
    })
  } catch {
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 })
  }
}
