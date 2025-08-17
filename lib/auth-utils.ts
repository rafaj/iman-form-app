import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  
  // With JWT sessions, we get the user info from the session token
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole
  }
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Authentication required")
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole
  }
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Authentication required")
  }
  
  // Check if user is admin based on email or role
  const isAdminUser = session.user.email === process.env.ADMIN_EMAIL || session.user.role === 'ADMIN'
  
  if (!isAdminUser) {
    throw new Error("Admin access required")
  }
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: 'ADMIN' as UserRole
  }
}

export async function isAdmin() {
  try {
    await requireAdmin()
    return true
  } catch {
    return false
  }
}