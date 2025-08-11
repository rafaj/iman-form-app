import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDeployment() {
  console.log('🔍 Verifying deployment setup...\n')

  try {
    // Test database connection
    console.log('1. Testing database connection...')
    const memberCount = await prisma.member.count()
    const applicationCount = await prisma.application.count()
    console.log(`   ✅ Database connected: ${memberCount} members, ${applicationCount} applications\n`)

    // Check environment variables
    console.log('2. Checking environment variables...')
    const requiredEnvVars = [
      'DATABASE_URL',
      'RESEND_API_KEY', 
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
      'NEXTAUTH_SECRET'
    ]

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      if (value) {
        console.log(`   ✅ ${envVar}: Set (${value.length} characters)`)
      } else {
        console.log(`   ❌ ${envVar}: Missing!`)
      }
    }

    // Check admin credentials
    console.log('\n3. Checking admin security...')
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminPassword === 'iman-admin-2024') {
      console.log('   ⚠️  WARNING: Using default admin password! Change this for production!')
    } else {
      console.log('   ✅ Admin password: Custom password set')
    }

    // Check database provider
    console.log('\n4. Checking database configuration...')
    const databaseUrl = process.env.DATABASE_URL || ''
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      console.log('   ✅ Database: PostgreSQL (production ready)')
    } else if (databaseUrl.startsWith('file:')) {
      console.log('   ⚠️  Database: SQLite (development only)')
    } else {
      console.log('   ❌ Database: Unknown provider')
    }

    // List active members
    console.log('\n5. Active members who can sponsor:')
    const activeMembers = await prisma.member.findMany({
      where: { active: true },
      select: { name: true, email: true }
    })

    if (activeMembers.length === 0) {
      console.log('   ❌ No active members found! Add members to enable sponsorship.')
    } else {
      activeMembers.forEach(member => {
        console.log(`   ✅ ${member.name} (${member.email})`)
      })
    }

    console.log('\n🎉 Deployment verification complete!')
    
    if (activeMembers.length === 0) {
      console.log('\n📝 Next steps:')
      console.log('   1. Add your existing members using scripts/create-production-members.ts')
      console.log('   2. Update WhatsApp group invite link in lib/whatsapp.ts')
      console.log('   3. Test the application flow')
    }

  } catch (error) {
    console.error('❌ Deployment verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDeployment()
