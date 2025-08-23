import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { validateAdminRequest } from "@/lib/admin-auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const SendEmailSchema = z.object({
  to: z.string().email(),
  toName: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = validateAdminRequest(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin login required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, toName, subject, message } = SendEmailSchema.parse(body)

    // Use your verified domain now that it's set up in Resend
    const emailFrom = 'admin@iman-wa.pro'

    // Create HTML email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
          IMAN Professional Network
        </h1>
        <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 14px;">
          Admin Communication
        </p>
      </div>

      <!-- Content -->
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
          Dear ${toName},
        </p>
        
        <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p style="margin: 0;">
            Best regards,<br>
            IMAN Professional Network Admin
          </p>
          <p style="margin: 15px 0 0 0;">
            <strong>Contact Information:</strong><br>
            Email: info@iman-wa.org<br>
            Phone: (206) 202-IMAN (4626)<br>
            Address: 515 State St. S, Kirkland, WA 98033
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">
          This email was sent from the IMAN Professional Network Admin Panel
        </p>
        <p style="margin: 5px 0 0 0;">
          © ${new Date().getFullYear()} IMAN Professional Network. All rights reserved.
        </p>
      </div>
    </body>
    </html>
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: emailFrom.includes('@resend.dev') ? `IMAN Admin <${emailFrom}>` : `IMAN Admin <${emailFrom}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
      replyTo: process.env.EMAIL_FROM || 'info@iman-wa.org' // Set reply-to to your actual email
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({
        success: false,
        message: "Failed to send email"
      }, { status: 500 })
    }

    console.log(`✅ Admin email sent to ${toName} (${to}): ${subject}`)

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: data?.id
    })

  } catch (error) {
    console.error("Send email error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Invalid email data provided"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: "Failed to send email"
    }, { status: 500 })
  }
}