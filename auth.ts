import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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