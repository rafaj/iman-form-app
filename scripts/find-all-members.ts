import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findAllMembers() {
  console.log('Listing all members...')
  
  const allMembers = await prisma.member.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

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
  })

  // Check for actual duplicate emails by grouping
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
    console.log('\n=== DUPLICATE EMAILS FOUND ===')
    duplicateEmails.forEach(([email, members]) => {
      console.log(`\nDuplicate Email: ${email} (${members.length} entries)`)
      members.forEach((member, index) => {
        console.log(`  ${index + 1}. Name: ${member.name}`)
        console.log(`     ID: ${member.id}`)
        console.log(`     Created: ${member.createdAt}`)
        console.log(`     Professional Qualification: ${member.professionalQualification || 'None'}`)
        console.log(`     Interest: ${member.interest || 'None'}`)
        console.log(`     Employer: ${member.employer || 'None'}`)
        console.log(`     LinkedIn: ${member.linkedin || 'None'}`)
        console.log(`     Skills: ${member.skills || 'None'}`)
        console.log(`     School: ${member.school || 'None'}`)
      })
    })
  } else {
    console.log('\n=== NO DUPLICATE EMAILS FOUND ===')
  }

  await prisma.$disconnect()
}

findAllMembers().catch((error) => {
  console.error('Error finding members:', error)
  process.exit(1)
})