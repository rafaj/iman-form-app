// Node.js built-in fetch is available in Node 18+
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resendWelcomeEmails() {
  try {
    // Get recent members (created in last 7 days) who might need welcome emails
    const recentMembers = await prisma.member.findMany({
      where: {
        active: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
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

    console.log('\n🎯 Recent Members (Last 7 Days):')
    console.log('=================================')
    
    if (recentMembers.length === 0) {
      console.log('No recent members found.')
      return
    }

    // Since these members were added directly (not through application process),
    // we'll send them approval notification emails as a welcome
    for (const member of recentMembers) {
      console.log(`\n📨 Sending welcome email to ${member.name} (${member.email})...`)
      
      try {
        // Use the sendActivationEmail function directly via API
        const response = await fetch('http://localhost:3000/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicantName: member.name,
            applicantEmail: member.email,
            type: member.user ? 'approval' : 'activation' // Send activation if no user account
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`✅ ${member.name}: Welcome email sent successfully`)
        } else {
          const error = await response.text()
          console.log(`❌ ${member.name}: Failed to send welcome email - ${error}`)
        }
      } catch (error) {
        console.log(`❌ ${member.name}: Error sending welcome email - ${error.message}`)
      }
    }

    console.log('\n✨ Welcome email resending completed!')
    
  } catch (error) {
    console.error('Error resending welcome emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  resendWelcomeEmails()
}

module.exports = { resendWelcomeEmails }