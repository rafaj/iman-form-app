import "server-only"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"

export const adapter = PrismaAdapter(prisma)
