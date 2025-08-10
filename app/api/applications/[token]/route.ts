import { type NextRequest, NextResponse } from "next/server"
import { getApplicationByToken, maskEmail, expireOldApplications } from "@/lib/database"
import { ApplicationStatus } from "@prisma/client"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    await expireOldApplications()
    const { token } = await params
    const app = await getApplicationByToken(token)
    if (!app) {
      return NextResponse.json({ message: "Unknown or invalid approval link." }, { status: 404 })
    }
    if (app.status === ApplicationStatus.EXPIRED) {
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
