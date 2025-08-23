import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendActivationEmail, sendApprovalNotificationEmail } from "@/lib/email"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

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
      // Send a welcome email with login link for members added directly
      const { data, error } = await resend.emails.send({
        from: 'IMAN Professional Network <admin@iman-wa.pro>',
        to: [applicantEmail],
        subject: '🎉 Welcome to IMAN Professional Network!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to IMAN!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Professional Network</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <p style="font-size: 18px; margin-bottom: 20px;">Dear ${applicantName},</p>
              
              <p style="margin-bottom: 20px;">🎉 <strong>Congratulations!</strong> You have been added to the IMAN Professional Network community!</p>
              
              <p style="margin-bottom: 25px;">To access your membership benefits and connect with fellow professionals, please sign in to our platform:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
                   style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Sign In to IMAN
                </a>
              </div>
              
              <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 16px;">What's Available?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Join our weekly networking events</li>
                  <li>Access the community forum</li>
                  <li>Connect with fellow professionals</li>
                  <li>Participate in mentorship programs</li>
                  <li>Explore professional opportunities</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="color: #10b981; word-break: break-all;">${process.env.NEXTAUTH_URL}/auth/signin</a>
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280;">
                <p>Best regards,<br>The IMAN Professional Network Team</p>
                <p style="margin-top: 15px;"><em>Building bridges. Creating opportunities. Strengthening communities.</em></p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      if (error) {
        console.error(`❌ Failed to send welcome email to ${applicantName}:`, error)
        return NextResponse.json({
          success: false,
          message: "Failed to send welcome email"
        }, { status: 500 })
      }

      console.log(`✅ Welcome email sent to ${applicantName}`)
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully"
      })
    } else {
      // Send approval notification
      await sendApprovalNotificationEmail({
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