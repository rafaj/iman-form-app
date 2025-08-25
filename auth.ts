import "server-only"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { adapter } from "@/lib/auth-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
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
        await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: email, url }),
        })
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