const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRecentApprovals() {
  try {
    // Check ALL members (not just active ones) to see who might need welcome emails
    const members = await prisma.member.findMany({
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

    console.log('\n📋 All Members in Database:')
    console.log('============================')
    
    if (members.length === 0) {
      console.log('No members found.')
    } else {
      members.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.name} (${member.email})`)
        console.log(`   Active: ${member.active}`)
        console.log(`   Role: ${member.user?.role || 'No User Account'}`)
        console.log(`   Created: ${member.createdAt?.toLocaleString()}`)
      })
    }

    // Also check applications
    const allApplications = await prisma.application.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        applicantName: true,
        applicantEmail: true,
        status: true,
        approvedAt: true,
        activatedAt: true,
        activationToken: true,
        createdAt: true
      }
    })

    console.log('\n📋 All Applications:')
    console.log('==================')
    
    if (allApplications.length === 0) {
      console.log('No applications found.')
    } else {
      allApplications.forEach((app, index) => {
        console.log(`\n${index + 1}. ${app.applicantName} (${app.applicantEmail})`)
        console.log(`   Status: ${app.status}`)
        console.log(`   Created: ${app.createdAt?.toLocaleString()}`)
        console.log(`   Approved: ${app.approvedAt?.toLocaleString() || 'Not approved'}`)
        console.log(`   Activated: ${app.activatedAt ? app.activatedAt.toLocaleString() : 'Not activated'}`)
        console.log(`   Has Activation Token: ${app.activationToken ? 'Yes' : 'No'}`)
      })
    }

    // Also check users who might not have member records
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            active: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 All Users in Database:')
    console.log('=========================')
    
    if (users.length === 0) {
      console.log('No users found.')
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} (${user.email})`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Has Member Record: ${user.member ? 'Yes (Active: ' + user.member.active + ')' : 'No'}`)
        console.log(`   Created: ${user.createdAt?.toLocaleString()}`)
      })
    }

    return { members, applications: allApplications, users }
  } catch (error) {
    console.error('Error checking recent approvals:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

// Function signature kept for later use with email integration

// If run directly, check recent approvals
if (require.main === module) {
  checkRecentApprovals().then((applications) => {
    if (applications.length > 0) {
      console.log('\n💡 Found recent applications. Will create API calls to resend emails...')
    }
  })
}