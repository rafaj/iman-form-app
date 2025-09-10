import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findQasimDuplicates() {
  console.log('Searching for Qasim Abbas entries...')
  
  // Search for members with "qasim" and "abbas" in the name
  const qasimEntries = await prisma.member.findMany({
    where: {
      OR: [
        {
          name: {
            contains: 'qasim',
            mode: 'insensitive'
          }
        },
        {
          name: {
            contains: 'abbas',
            mode: 'insensitive'
          }
        },
        {
          AND: [
            {
              name: {
                contains: 'qasim',
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: 'abbas',
                mode: 'insensitive'
              }
            }
          ]
        }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  console.log(`Found ${qasimEntries.length} entries:`)
  
  qasimEntries.forEach((member, index) => {
    console.log(`\n--- Entry ${index + 1} ---`)
    console.log(`ID: ${member.id}`)
    console.log(`Name: ${member.name}`)
    console.log(`Email: ${member.email}`)
    console.log(`Active: ${member.active}`)
    console.log(`Created: ${member.createdAt}`)
    console.log(`Updated: ${member.updatedAt}`)
    console.log(`User ID: ${member.userId}`)
    console.log(`Professional Qualification: ${member.professionalQualification}`)
    console.log(`Interest: ${member.interest}`)
    console.log(`Contribution: ${member.contribution}`)
    console.log(`Employer: ${member.employer}`)
    console.log(`LinkedIn: ${member.linkedin}`)
    console.log(`Skills: ${member.skills}`)
    console.log(`School: ${member.school}`)
    console.log(`Available as Mentor: ${member.availableAsMentor}`)
    console.log(`Mentor Profile: ${member.mentorProfile}`)
    console.log(`Seeking Mentor: ${member.seekingMentor}`)
    console.log(`Mentee Profile: ${member.menteeProfile}`)
  })

  // Also search for potential email duplicates
  const allMembers = await prisma.member.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    },
    orderBy: {
      email: 'asc'
    }
  })

  // Group by email to find duplicates
  const emailGroups = allMembers.reduce((acc, member) => {
    if (!acc[member.email]) {
      acc[member.email] = []
    }
    acc[member.email].push(member)
    return acc
  }, {} as Record<string, typeof allMembers>)

  const duplicateEmails = Object.entries(emailGroups).filter(([email, members]) => members.length > 1)
  
  if (duplicateEmails.length > 0) {
    console.log('\n=== DUPLICATE EMAILS FOUND ===')
    duplicateEmails.forEach(([email, members]) => {
      console.log(`\nEmail: ${email} (${members.length} entries)`)
      members.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} (ID: ${member.id}, Created: ${member.createdAt})`)
      })
    })
  } else {
    console.log('\n=== NO DUPLICATE EMAILS FOUND ===')
  }

  await prisma.$disconnect()
}

findQasimDuplicates().catch((error) => {
  console.error('Error finding duplicates:', error)
  process.exit(1)
})