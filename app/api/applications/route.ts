import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createApplication, findMemberByEmail } from "@/lib/database"
import { sendSponsorNotificationEmail } from "@/lib/email"
import { 
  checkRateLimit, 
  validateEmail, 
  validateName, 
  detectSuspiciousPatterns,
  logSecurityEvent 
} from "@/lib/security"

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
    .regex(/^[0-9]{3,5}(?:-?[0-9]{0,4})?$/i, { message: "Invalid ZIP format" }),

  professionalQualification: z.string().min(2).max(200),
  interest: z.string().min(10).max(2000),
  contribution: z.string().min(10).max(2000),

  employer: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  linkedin: z.preprocess(emptyToUndefined, z.string().url().max(300).optional()),

  // Mentorship fields (optional)
  availableAsMentor: z.boolean().default(false),
  mentorProfile: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
  seekingMentor: z.boolean().default(false),
  menteeProfile: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
})

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Rate limiting by IP
    const ipRateLimit = checkRateLimit(`ip:${clientIp}`, 3, 15 * 60 * 1000) // 3 per 15 minutes
    if (!ipRateLimit.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip: clientIp,
        userAgent,
        details: { type: 'ip_rate_limit', resetTime: ipRateLimit.resetTime }
      })
      
      return NextResponse.json(
        { 
          message: "Too many applications. Please wait before submitting again.",
          resetTime: ipRateLimit.resetTime 
        },
        { status: 429 }
      )
    }

    const json = await req.json()
    const body = CreateSchema.parse(json)

    // Additional validation
    if (!validateEmail(body.applicantEmail) || !validateEmail(body.sponsorEmail)) {
      return NextResponse.json({ message: "Invalid email format." }, { status: 400 })
    }

    if (!validateName(body.applicantName)) {
      return NextResponse.json({ message: "Invalid name format." }, { status: 400 })
    }

    // Prevent self-sponsorship
    if (body.applicantEmail.toLowerCase() === body.sponsorEmail.toLowerCase()) {
      return NextResponse.json({ message: "You cannot sponsor yourself." }, { status: 400 })
    }

    // Rate limiting by email
    const emailRateLimit = checkRateLimit(`email:${body.applicantEmail.toLowerCase()}`, 2, 24 * 60 * 60 * 1000) // 2 per day
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { message: "You have already submitted applications recently. Please wait before submitting again." },
        { status: 429 }
      )
    }

    // Ensure sponsor exists and is active
    const sponsor = await findMemberByEmail(body.sponsorEmail)
    if (!sponsor || !sponsor.active) {
      return NextResponse.json({ message: "Sponsor must be an active existing member." }, { status: 400 })
    }

    // Security analysis
    const suspiciousPatterns = detectSuspiciousPatterns({
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      sponsorEmail: body.sponsorEmail,
      professionalQualification: body.professionalQualification,
      interest: body.interest
    })
    
    if (suspiciousPatterns.length > 0) {
      logSecurityEvent({
        type: 'suspicious_activity',
        ip: clientIp,
        userAgent,
        details: { 
          patterns: suspiciousPatterns,
          applicantEmail: body.applicantEmail,
          sponsorEmail: body.sponsorEmail
        }
      })
    }

    const app = await createApplication({
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

      // Mentorship fields
      availableAsMentor: body.availableAsMentor,
      mentorProfile: body.mentorProfile,
      seekingMentor: body.seekingMentor,
      menteeProfile: body.menteeProfile,
    })

    const origin = req.headers.get("origin") || req.nextUrl.origin
    const approvalLink = `${origin}/approve/${app.token}`

    // Send email notification to sponsor
    try {
      await sendSponsorNotificationEmail({
        sponsorEmail: sponsor.email,
        sponsorName: sponsor.name,
        applicantName: body.applicantName,
        applicantEmail: body.applicantEmail,
        approvalLink,
        verificationCode: app.verificationCode,
      })
      console.log(`Email sent successfully to sponsor: ${sponsor.email}`)
    } catch (emailError) {
      console.error('Failed to send sponsor notification email:', emailError)
      // Don't fail the entire request if email fails - the application is still created
    }

    return NextResponse.json({
      token: app.token,
      approvalLink,
    })
  } catch (err: unknown) {
    console.error("Application creation error:", err)
    
    if (err && typeof err === 'object' && 'name' in err && err.name === "ZodError") {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 })
    }
    
    // Log the actual error for debugging
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("Detailed error:", errorMessage)
    
    return NextResponse.json({ 
      message: "Unexpected error.", 
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 })
  }
}
