const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runExactAdminQuery() {
  try {
    console.log('🔍 Running EXACT Admin Panel Member Query')
    console.log('=========================================')
    
    // This is the exact query from /app/api/admin/members/route.ts
    const activeMembers = await prisma.member.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        approvalsInWindow: true,
        lastApprovalAt: true,
        // Professional info from member table (single source of truth)
        professionalQualification: true,
        interest: true,
        contribution: true,
        employer: true,
        linkedin: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'  // Show newest members first
      }
    })

    console.log(`\n📊 Active Members Found: ${activeMembers.length}`)
    console.log('=' .repeat(60))

    if (activeMembers.length === 0) {
      console.log('❌ No active members found!')
    } else {
      for (let i = 0; i < activeMembers.length; i++) {
        const member = activeMembers[i]
        console.log(`\n${i + 1}. ${member.name}`)
        console.log(`   📧 Email: ${member.email}`)
        console.log(`   👤 User Account: ${member.user ? member.user.role : 'No Account'}`)
        console.log(`   💼 Employer: ${member.employer || 'Not specified'}`)
        console.log(`   🎓 Qualification: ${member.professionalQualification || 'Not specified'}`)
        console.log(`   📅 Created: ${member.createdAt.toLocaleString()}`)
        console.log(`   🔗 LinkedIn: ${member.linkedin || 'Not specified'}`)
      }
    }

    // Now let's also check if there are any inactive members we're missing
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

    console.log(`\n\n📊 ALL Members (Active + Inactive): ${allMembers.length}`)
    console.log('=' .repeat(60))
    
    allMembers.forEach((member, index) => {
      const status = member.active ? '✅ Active' : '❌ Inactive'
      const userStatus = member.user ? `(${member.user.role})` : '(No Account)'
      console.log(`${index + 1}. ${member.name} - ${status} ${userStatus}`)
      console.log(`   📧 ${member.email}`)
    })

    return { activeMembers, allMembers }

  } catch (error) {
    console.error('❌ Database connection error:', error)
    console.error('Connection string being used:', process.env.DATABASE_URL ? 'Found' : 'Not found')
    
    // Let's also try to see if we can connect at all
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database connection works')
    } catch (connectError) {
      console.error('❌ Cannot connect to database:', connectError.message)
    }
    
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  runExactAdminQuery()
}

module.exports = { runExactAdminQuery }