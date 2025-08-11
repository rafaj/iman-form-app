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
      from: 'IMAN Professional Network <noreply@yourdomain.com>', // You'll need to update this
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
