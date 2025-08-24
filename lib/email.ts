import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSponsorNotificationEmail({
  sponsorEmail,
  sponsorName,
  applicantName,
  applicantEmail,
  approvalLink,
  verificationCode,
}: {
  sponsorEmail: string
  sponsorName: string
  applicantName: string
  applicantEmail: string
  approvalLink: string
  verificationCode: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'IMAN Professional Network <admin@iman-wa.pro>',
      to: [sponsorEmail],
      subject: `New Membership Application - ${applicantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Membership Application</h2>
          
          <p>Hello ${sponsorName},</p>
          
          <p>You have received a new membership application for IMAN Professional Network:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">Applicant Details</h3>
            <p><strong>Name:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> ${applicantEmail}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #d97706;">Action Required</h3>
            <p>To review and approve this application, please:</p>
            <ol>
              <li>Click the approval link below</li>
              <li>Use this verification code: <strong style="background-color: #fff; padding: 4px 8px; border-radius: 4px;">${verificationCode}</strong></li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approvalLink}" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Application
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #6b7280;">
            <p><strong>Important:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This approval link expires in 7 days</li>
              <li>You must be logged in as an active member to approve</li>
              <li>Each application requires sponsor verification</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you did not expect this email or believe it was sent in error, please ignore it.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            IMAN Professional Network<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Email sending error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Email sent successfully:', data)
    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

export async function sendApprovalNotificationEmail({
  applicantName,
  applicantEmail,
}: {
  applicantName: string
  applicantEmail: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'IMAN Professional Network <admin@iman-wa.pro>',
      to: [applicantEmail],
      subject: '🎉 Welcome to IMAN Professional Network!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin-bottom: 10px;">🎉 Congratulations!</h1>
            <h2 style="color: #374151; margin-top: 0;">You've been approved to join IMAN Professional Network</h2>
          </div>
          
          <p>Dear ${applicantName},</p>
          
          <p>We're excited to welcome you to the IMAN Professional Network community! Your application has been reviewed and approved.</p>
          
          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">🎯 Get Started with IMAN</h3>
            <p style="margin-bottom: 20px;">You now have access to all member benefits and our professional community. Start connecting with fellow members and exploring opportunities.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #d1fae5; text-align: center;">
              <h4 style="margin: 0 0 10px 0; color: #059669; font-size: 18px;">Member Benefits</h4>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">Access exclusive events, networking opportunities, and community resources</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #d97706;">📋 Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>Log in to the IMAN platform to explore member features</li>
              <li>Update your LinkedIn to mention IMAN membership</li>
              <li>Start connecting with fellow members</li>
              <li>Share opportunities and insights</li>
              <li>Participate in community events and discussions</li>
            </ol>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d4ed8;">🤝 Community Guidelines</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
              <li>Keep all discussions professional and respectful</li>
              <li>Share opportunities and insights with the community</li>
              <li>Support fellow members in their professional journeys</li>
              <li>Follow Islamic principles in all interactions</li>
              <li>Respect privacy and confidentiality</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #059669; font-weight: bold;">Welcome to the family! 🌟</p>
            <p style="color: #6b7280;">We look forward to your contributions to our community.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            IMAN Professional Network<br>
            Building bridges in the Muslim professional community<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Approval email sending error:', error)
      throw new Error(`Failed to send approval email: ${error.message}`)
    }

    console.log('Approval email sent successfully:', data)
    return data
  } catch (error) {
    console.error('Approval email service error:', error)
    throw error
  }
}

interface SendActivationEmailParams {
  to: string
  applicantName: string
  activationToken: string
}

export async function sendActivationEmail({ 
  to, 
  applicantName, 
  activationToken 
}: SendActivationEmailParams) {
  const activationUrl = `${process.env.NEXTAUTH_URL}/activate/${activationToken}`
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'IMAN Professional Network <admin@iman-wa.pro>',
      to,
      subject: "🎉 Your IMAN Professional Network Application Has Been Approved!",
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
            
            <p style="margin-bottom: 20px;">🎉 <strong>Congratulations!</strong> Your application to join the IMAN Professional Network has been approved by your sponsor.</p>
            
            <p style="margin-bottom: 25px;">To complete your membership setup and access all member benefits, please create your account by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Create My Account
              </a>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 16px;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Click the button above to create your account</li>
                <li>Sign in using Google or Facebook</li>
                <li>Access weekly networking events</li>
                <li>Connect with fellow professionals</li>
                <li>Explore community resources</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${activationUrl}" style="color: #10b981; word-break: break-all;">${activationUrl}</a>
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
      console.error("Failed to send activation email:", error)
      throw new Error(`Failed to send activation email: ${error.message}`)
    }
    
    console.log('Activation email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error("Failed to send activation email:", error)
    return { success: false, error }
  }
}

export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string
  url: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'IMAN Professional Network <admin@iman-wa.pro>',
      to,
      subject: "Sign in to IMAN Professional Network",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">IMAN Professional Network</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Secure Sign-In Link</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hello,</p>
            
            <p style="margin-bottom: 25px;">Click the button below to sign in to your IMAN Professional Network account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Sign In
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${url}" style="color: #10b981; word-break: break-all;">${url}</a>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #6b7280;">
              <p>Best regards,<br>The IMAN Professional Network Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    
    if (error) {
      console.error("Failed to send magic link email:", error)
      throw new Error(`Failed to send magic link email: ${error.message}`)
    }
    
    console.log('Magic link email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error("Failed to send magic link email:", error)
    return { success: false, error }
  }
}
