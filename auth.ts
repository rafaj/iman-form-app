import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"
import { sendMagicLinkEmail } from "@/lib/email"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "IMAN Professional Network <noreply@iman-wa.pro>",
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({ to: email, url })
      },
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
        
        // Update lastSeenAt timestamp (throttled to once per 5 minutes)
        try {
          const now = new Date()
          const shouldUpdate = !user.lastSeenAt || 
            (now.getTime() - new Date(user.lastSeenAt).getTime()) > 5 * 60 * 1000 // 5 minutes
          
          if (shouldUpdate) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastSeenAt: now }
            })
          }
        } catch (error) {
          // Silently fail - don't block the session if lastSeenAt update fails
          console.error('Failed to update lastSeenAt:', error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  debug: process.env.NODE_ENV === "development",
})