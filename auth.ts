import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "IMAN Professional Network <noreply@iman-wa.pro>",
      async sendVerificationRequest({ identifier: email, url }) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        
        const { host } = new URL(url)
        
        await resend.emails.send({
          from: "IMAN Professional Network <noreply@iman-wa.pro>",
          to: [email],
          subject: "Sign in to IMAN Professional Network",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 40px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">IMAN Professional Network</h1>
                <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">Connecting Muslim Professionals in Seattle Metro</p>
              </div>
              
              <!-- Main Content -->
              <div style="background-color: white; padding: 40px;">
                <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">Sign in to your account</h2>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                  Click the button below to securely sign in to the IMAN Professional Network platform:
                </p>
                
                <!-- Sign In Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" 
                     style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                            color: white; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                    Sign In to IMAN Platform
                  </a>
                </div>
                
                <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
                  <p style="color: #065f46; margin: 0; font-size: 14px;">
                    <strong>Security Notice:</strong> This link will expire in 24 hours and can only be used once. 
                    If you didn't request this sign-in link, you can safely ignore this email.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="color: #059669; word-break: break-all;">${url}</span>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #059669; color: white; padding: 30px 40px; text-align: center;">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
                <p style="color: #d1fae5; margin: 5px 0; font-size: 14px;">📧 info@iman-wa.org</p>
                <p style="color: #d1fae5; margin: 5px 0; font-size: 14px;">📞 (206) 202-IMAN (4626)</p>
                <p style="color: #d1fae5; margin: 5px 0; font-size: 14px;">📍 515 State St. S, Kirkland, WA 98033</p>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #047857;">
                  <p style="color: #d1fae5; margin: 0; font-size: 12px;">
                    © 2025 IMAN Professional Network. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          `
        })
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.log(`❌ Access denied: No email provided`)
        return false
      }

      // Allow admins to sign in
      if (user.email === process.env.ADMIN_EMAIL) {
        console.log(`✅ Admin access granted for ${user.email}`)
        return true
      }

      try {
        // Check if user has an approved application or is already a member
        const approvedApplication = await prisma.application.findFirst({
          where: {
            applicantEmail: user.email,
            status: "APPROVED"
          }
        })

        // Also check if user is already a member (manually added by admin)
        const existingMember = await prisma.member.findUnique({
          where: {
            email: user.email,
            active: true
          }
        })

        if (!approvedApplication && !existingMember) {
          // No approved application or existing member found
          console.log(`❌ Access denied for ${user.email}: No approved application or active membership found`)
          return false
        }

        console.log(`✅ Access granted for ${user.email}: ${approvedApplication ? 'Approved application' : 'Active member'} found`)
        return true
      } catch (error) {
        console.error(`❌ Database error during signin for ${user.email}:`, error)
        return false
      }
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        session.user.role = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "MEMBER"
        session.user.email = user.email
        session.user.name = user.name
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})