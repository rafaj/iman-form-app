import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_cEs7t6JoTQnr@ep-lucky-sea-aeeqncu6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pool_timeout=30&connection_limit=3"
    }
  }
})

async function checkProductionDuplicates() {
  console.log('Connecting to PRODUCTION database...')
  console.log('Searching for all members...')
  
  try {
    const allMembers = await prisma.member.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n=== PRODUCTION DATABASE ===`)
    console.log(`Found ${allMembers.length} total members:`)
    
    allMembers.forEach((member, index) => {
      console.log(`\n--- Member ${index + 1} ---`)
      console.log(`ID: ${member.id}`)
      console.log(`Name: ${member.name}`)
      console.log(`Email: ${member.email}`)
      console.log(`Active: ${member.active}`)
      console.log(`Created: ${member.createdAt}`)
      console.log(`Professional Qualification: ${member.professionalQualification || 'None'}`)
      console.log(`Interest: ${member.interest || 'None'}`)
      console.log(`Employer: ${member.employer || 'None'}`)
      console.log(`LinkedIn: ${member.linkedin || 'None'}`)
      console.log(`Skills: ${member.skills || 'None'}`)
      console.log(`School: ${member.school || 'None'}`)
    })

    // Check for duplicate emails by grouping
    const emailGroups = allMembers.reduce((acc, member) => {
      const email = member.email.toLowerCase()
      if (!acc[email]) {
        acc[email] = []
      }
      acc[email].push(member)
      return acc
    }, {} as Record<string, typeof allMembers>)

    const duplicateEmails = Object.entries(emailGroups).filter(([email, members]) => members.length > 1)
    
    if (duplicateEmails.length > 0) {
      console.log('\n🚨 === DUPLICATE EMAILS FOUND ===')
      duplicateEmails.forEach(([email, members]) => {
        console.log(`\nDuplicate Email: ${email} (${members.length} entries)`)
        members.forEach((member, index) => {
          console.log(`  Entry ${index + 1}:`)
          console.log(`    Name: ${member.name}`)
          console.log(`    ID: ${member.id}`)
          console.log(`    Created: ${member.createdAt}`)
          console.log(`    Professional Qualification: ${member.professionalQualification || 'None'}`)
          console.log(`    Interest: ${member.interest || 'None'}`)
          console.log(`    Employer: ${member.employer || 'None'}`)
          console.log(`    LinkedIn: ${member.linkedin || 'None'}`)
          console.log(`    Skills: ${member.skills || 'None'}`)
          console.log(`    School: ${member.school || 'None'}`)
        })
      })
    } else {
      console.log('\n✅ === NO DUPLICATE EMAILS FOUND IN PRODUCTION ===')
    }

    // Search specifically for Qasim
    const qasimMembers = allMembers.filter(member => 
      member.name.toLowerCase().includes('qasim') || 
      member.name.toLowerCase().includes('abbas')
    )

    if (qasimMembers.length > 0) {
      console.log(`\n🔍 === QASIM/ABBAS MEMBERS ===`)
      qasimMembers.forEach((member, index) => {
        console.log(`\nQasim/Abbas Member ${index + 1}:`)
        console.log(`Name: ${member.name}`)
        console.log(`Email: ${member.email}`)
        console.log(`ID: ${member.id}`)
        console.log(`Created: ${member.createdAt}`)
      })
    } else {
      console.log('\n❌ === NO QASIM/ABBAS MEMBERS FOUND ===')
    }

  } catch (error) {
    console.error('Error connecting to production database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionDuplicates().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})