import type { DefaultSession, DefaultUser } from "next-auth"
import type { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      memberId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRole
  }
}