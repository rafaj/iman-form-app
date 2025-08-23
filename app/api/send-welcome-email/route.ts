import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendActivationEmail, sendApprovalNotificationEmail } from "@/lib/email"
import crypto from "crypto"

const SendWelcomeEmailSchema = z.object({
  applicantName: z.string().min(1),
  applicantEmail: z.string().email(),
  type: z.enum(['activation', 'approval'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicantName, applicantEmail, type } = SendWelcomeEmailSchema.parse(body)

    console.log(`📧 Sending ${type} email to ${applicantName} (${applicantEmail})`)

    if (type === 'activation') {
      // Generate a temporary activation token for the welcome email
      const activationToken = crypto.randomBytes(32).toString('hex')
      
      const result = await sendActivationEmail({
        to: applicantEmail,
        applicantName: applicantName,
        activationToken: activationToken
      })

      if (result.success) {
        console.log(`✅ Activation email sent to ${applicantName}`)
        return NextResponse.json({
          success: true,
          message: "Activation email sent successfully"
        })
      } else {
        console.error(`❌ Failed to send activation email to ${applicantName}:`, result.error)
        return NextResponse.json({
          success: false,
          message: "Failed to send activation email"
        }, { status: 500 })
      }
    } else {
      // Send approval notification
      const result = await sendApprovalNotificationEmail({
        applicantName: applicantName,
        applicantEmail: applicantEmail
      })

      console.log(`✅ Approval notification sent to ${applicantName}`)
      return NextResponse.json({
        success: true,
        message: "Approval notification sent successfully"
      })
    }

  } catch (error) {
    console.error("Send welcome email error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Invalid email data provided"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: "Failed to send welcome email"
    }, { status: 500 })
  }
}