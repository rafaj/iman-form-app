import { prisma } from "../lib/database"
import { UserRole } from "@prisma/client"

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL
  
  if (!adminEmail) {
    console.error("Please set ADMIN_EMAIL environment variable")
    process.exit(1)
  }

  try {
    // Update user to admin role
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: UserRole.ADMIN },
      create: {
        email: adminEmail,
        name: "Admin User",
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      }
    })

    console.log(`✅ User ${user.email} is now an admin (ID: ${user.id})`)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()