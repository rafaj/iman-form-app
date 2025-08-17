import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      // Allow admins to sign in
      if (user.email === process.env.ADMIN_EMAIL) {
        return true
      }

      // Check if user has an approved application or is already a member
      const approvedApplication = await prisma.application.findFirst({
        where: {
          applicantEmail: user.email,
          status: "APPROVED"
        }
      })

      if (!approvedApplication) {
        // No approved application found
        return false
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "MEMBER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.userId as string
        session.user.role = token.role as "ADMIN" | "MEMBER"
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/auth/error",
  },
})