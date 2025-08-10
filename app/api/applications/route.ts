import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createApplication, findMemberByEmail } from "@/lib/db"

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v)

const CreateSchema = z.object({
  applicantName: z.string().min(2).max(100),
  applicantEmail: z.string().email().max(200),
  sponsorEmail: z.string().email().max(200),

  streetAddress: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zip: z
    .string()
    .min(3)
    .max(12)
    .regex(/^[0-9]{5}(?:-[0-9]{4})?$/i, { message: "Invalid ZIP format (use 12345 or 12345-6789)" }),

  professionalQualification: z.string().min(2).max(200),
  interest: z.string().min(10).max(2000),
  contribution: z.string().min(10).max(2000),

  employer: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  linkedin: z.preprocess(emptyToUndefined, z.string().url().max(300).optional()),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const body = CreateSchema.parse(json)

    // Ensure sponsor exists and is active
    const sponsor = findMemberByEmail(body.sponsorEmail)
    if (!sponsor || !sponsor.active) {
      return NextResponse.json({ message: "Sponsor must be an active existing member." }, { status: 400 })
    }

    const app = createApplication({
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      sponsorEmail: body.sponsorEmail,
      sponsorMemberId: sponsor.id,

      streetAddress: body.streetAddress,
      city: body.city,
      state: body.state,
      zip: body.zip,
      professionalQualification: body.professionalQualification,
      interest: body.interest,
      contribution: body.contribution,
      employer: body.employer,
      linkedin: body.linkedin,
    })

    const origin = req.headers.get("origin") || req.nextUrl.origin
    const approvalLink = `${origin}/approve/${app.token}`

    return NextResponse.json({
      token: app.token,
      approvalLink,
      demoVerificationCode: app.verificationCode,
    })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 })
    }
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 })
  }
}
