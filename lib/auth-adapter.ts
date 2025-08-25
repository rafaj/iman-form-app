import "server-only" // 🚨 CRITICAL: This file CANNOT be imported in middleware or client components
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/database"

export const adapter = PrismaAdapter(prisma)
