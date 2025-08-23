const { PrismaClient } = require('@prisma/client')

// Use production database URL directly
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_7Fl0hmTWqtSj@ep-fragrant-scene-aegp8knq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

async function checkProductionMembers() {
  try {
    console.log('🔍 Checking PRODUCTION Database for Members')
    console.log('============================================')
    
    // Get ALL members
    const allMembers = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
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

    console.log(`\n📊 Total Members Found: ${allMembers.length}`)
    console.log('=' .repeat(50))

    if (allMembers.length === 0) {
      console.log('❌ No members found in database!')
    } else {
      allMembers.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.name}`)
        console.log(`   📧 Email: ${member.email}`)
        console.log(`   ✅ Active: ${member.active}`)
        console.log(`   👤 User Account: ${member.user ? member.user.role : 'No Account'}`)
        console.log(`   📅 Created: ${member.createdAt.toLocaleString()}`)
      })
    }

    // Also check ALL users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n\n👥 Total Users Found: ${allUsers.length}`)
    console.log('=' .repeat(50))

    if (allUsers.length === 0) {
      console.log('❌ No users found in database!')
    } else {
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`)
        console.log(`   📧 Email: ${user.email}`)
        console.log(`   🎭 Role: ${user.role}`)
        console.log(`   👤 Member Record: ${user.member ? `${user.member.name} (Active: ${user.member.active})` : 'No Member Record'}`)
        console.log(`   📅 Created: ${user.createdAt.toLocaleString()}`)
      })
    }

    // Show members who need welcome emails (active members without user accounts)
    const needsWelcomeEmail = allMembers.filter(member => member.active && !member.user)
    
    console.log(`\n\n📧 Members Who Need Welcome Emails: ${needsWelcomeEmail.length}`)
    console.log('=' .repeat(50))
    
    if (needsWelcomeEmail.length > 0) {
      needsWelcomeEmail.forEach((member, index) => {
        console.log(`${index + 1}. ${member.name} (${member.email})`)
      })
    } else {
      console.log('✅ All active members have user accounts!')
    }

    return { allMembers, allUsers, needsWelcomeEmail }

  } catch (error) {
    console.error('❌ Error checking production members:', error)
    console.error('Full error:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  checkProductionMembers()
}

module.exports = { checkProductionMembers }