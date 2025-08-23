const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRecentApprovals() {
  try {
    // Check members first to see who might need welcome emails
    const members = await prisma.member.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
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

    console.log('\n📋 Active Members:')
    console.log('==================')
    
    if (members.length === 0) {
      console.log('No active members found.')
    } else {
      members.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.name} (${member.email})`)
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

    return { members, applications: allApplications }
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