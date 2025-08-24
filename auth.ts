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
          subject: "🔑 Your secure access to IMAN Professional Network",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>IMAN Professional Network Sign In</title>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 40px 30px; text-align: center; position: relative;">
                  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"20\" cy=\"20\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"80\" cy=\"40\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"40\" cy=\"80\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat;"></div>
                  <div style="position: relative; z-index: 1;">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">IMAN Professional Network</h1>
                    <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Connecting Muslim Professionals Across Seattle Metro</p>
                  </div>
                </div>
                
                <!-- Welcome Section -->
                <div style="padding: 40px 30px 30px; text-align: center; border-bottom: 1px solid #f0f9ff;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); padding: 12px; border-radius: 50%; margin-bottom: 20px;">
                    <span style="color: white; font-size: 24px; line-height: 1;">🔐</span>
                  </div>
                  <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 28px; font-weight: 700;">Welcome back!</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0; max-width: 400px; margin-left: auto; margin-right: auto;">
                    You're one click away from accessing your professional community. Secure, simple, and ready for you.
                  </p>
                </div>
                
                <!-- Sign In Button -->
                <div style="padding: 40px 30px; text-align: center;">
                  <a href="${url}" 
                     style="display: inline-block; 
                            background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
                            color: white; 
                            padding: 18px 40px; 
                            text-decoration: none; 
                            border-radius: 12px; 
                            font-weight: 700; 
                            font-size: 16px;
                            letter-spacing: 0.5px;
                            box-shadow: 0 8px 16px rgba(5, 150, 105, 0.3);
                            transition: all 0.2s ease;
                            border: 3px solid transparent;">
                    ✨ Access Your Account
                  </a>
                  
                  <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; border: 1px solid #bbf7d0;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                      <span style="color: #059669; font-size: 18px; margin-right: 8px;">🛡️</span>
                      <span style="color: #059669; font-weight: 600; font-size: 14px;">SECURE ACCESS</span>
                    </div>
                    <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
                      This magic link expires in <strong>24 hours</strong> and works only once. 
                      Didn't request this? Simply ignore this email.
                    </p>
                  </div>
                  
                  <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                      <strong>Having trouble with the button?</strong><br>
                      Copy and paste this link: <br>
                      <span style="color: #059669; word-break: break-all; font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">${url}</span>
                    </p>
                  </div>
                </div>
                
                <!-- Community Highlights -->
                <div style="background: linear-gradient(135deg, #fafafa 0%, #f8fafc 100%); padding: 30px; border-top: 1px solid #e2e8f0;">
                  <div style="text-align: center; margin-bottom: 25px;">
                    <h3 style="color: #059669; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🌟 What's waiting for you</h3>
                  </div>
                  <div style="display: table; width: 100%; margin: 0;">
                    <div style="display: table-cell; width: 33.33%; padding: 0 10px; text-align: center; vertical-align: top;">
                      <div style="color: #059669; font-size: 20px; margin-bottom: 8px;">💼</div>
                      <p style="color: #475569; font-size: 12px; font-weight: 500; margin: 0; line-height: 1.4;">Professional Directory</p>
                    </div>
                    <div style="display: table-cell; width: 33.33%; padding: 0 10px; text-align: center; vertical-align: top;">
                      <div style="color: #059669; font-size: 20px; margin-bottom: 8px;">🤝</div>
                      <p style="color: #475569; font-size: 12px; font-weight: 500; margin: 0; line-height: 1.4;">Weekly Meetups</p>
                    </div>
                    <div style="display: table-cell; width: 33.33%; padding: 0 10px; text-align: center; vertical-align: top;">
                      <div style="color: #059669; font-size: 20px; margin-bottom: 8px;">💬</div>
                      <p style="color: #475569; font-size: 12px; font-weight: 500; margin: 0; line-height: 1.4;">Community Forum</p>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #0f172a; color: white; padding: 35px 30px; text-align: center;">
                  <div style="margin-bottom: 20px;">
                    <h4 style="color: #10b981; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Stay Connected</h4>
                    <div style="margin: 0;">
                      <p style="color: #94a3b8; margin: 4px 0; font-size: 14px;">📧 info@iman-wa.org</p>
                      <p style="color: #94a3b8; margin: 4px 0; font-size: 14px;">📞 (206) 202-IMAN (4626)</p>
                      <p style="color: #94a3b8; margin: 4px 0; font-size: 14px;">📍 515 State St. S, Kirkland, WA 98033</p>
                    </div>
                  </div>
                  
                  <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                      © 2025 IMAN Professional Network. Building bridges in our community.
                    </p>
                  </div>
                </div>
                
              </div>
            </body>
            </html>
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

      // Allow magic link generation for all users to prevent Prisma browser errors
      // Member verification will be handled after successful authentication
      console.log(`🔄 Sign-in attempted for ${user.email} - allowing magic link generation`)
      return true
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