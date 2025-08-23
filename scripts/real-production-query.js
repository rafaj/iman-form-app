const { PrismaClient } = require('@prisma/client')

// Use the ACTUAL production database URL
const PRODUCTION_DATABASE_URL = "postgresql://neondb_owner:npg_cEs7t6JoTQnr@ep-lucky-sea-aeeqncu6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const prisma = new PrismaClient({
  datasourceUrl: PRODUCTION_DATABASE_URL
})

async function getRealProductionMembers() {
  try {
    console.log('🎯 Connecting to ACTUAL Production Database')
    console.log('===========================================')
    console.log('Database: ep-lucky-sea-aeeqncu6-pooler.c-2.us-east-2.aws.neon.tech')
    console.log('')
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Successfully connected to production database!')
    console.log('')

    // Get ALL members from production
    const allMembers = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        professionalQualification: true,
        employer: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 PRODUCTION Members Found: ${allMembers.length}`)
    console.log('=' .repeat(70))

    if (allMembers.length === 0) {
      console.log('❌ No members found in production database!')
    } else {
      allMembers.forEach((member, index) => {
        const status = member.active ? '✅ ACTIVE' : '❌ Inactive'
        const userStatus = member.user ? `(${member.user.role})` : '(No User Account)'
        
        console.log(`\n${index + 1}. ${member.name} - ${status}`)
        console.log(`   📧 Email: ${member.email}`)
        console.log(`   👤 User Account: ${userStatus}`)
        console.log(`   💼 Employer: ${member.employer || 'Not specified'}`)
        console.log(`   🎓 Qualification: ${member.professionalQualification || 'Not specified'}`)
        console.log(`   📅 Created: ${member.createdAt.toLocaleString()}`)
      })
    }

    // Show who needs welcome emails
    const needsWelcomeEmail = allMembers.filter(member => member.active && !member.user)
    
    console.log(`\n\n📧 Members Who Need Welcome Emails: ${needsWelcomeEmail.length}`)
    console.log('=' .repeat(70))
    
    if (needsWelcomeEmail.length > 0) {
      needsWelcomeEmail.forEach((member, index) => {
        console.log(`${index + 1}. ${member.name} (${member.email})`)
      })
      
      console.log('\n💡 These members need welcome emails because they are active but have no user accounts.')
    } else {
      console.log('✅ All active members have user accounts!')
    }

    return { allMembers, needsWelcomeEmail }

  } catch (error) {
    console.error('❌ Error connecting to production database:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  getRealProductionMembers()
}

module.exports = { getRealProductionMembers }