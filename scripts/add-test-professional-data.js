#!/usr/bin/env node

/**
 * Add test professional information to existing member
 * so we can see the directory working properly
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestData() {
  try {
    console.log('🔄 Adding test professional data to existing member...')
    
    // Find the existing member
    const member = await prisma.member.findFirst({
      where: { active: true }
    })

    if (!member) {
      console.log('❌ No active members found')
      return
    }

    console.log(`Found member: ${member.name} (${member.email})`)

    // Add professional information
    await prisma.member.update({
      where: { id: member.id },
      data: {
        professionalQualification: "Senior Software Engineer with 8+ years experience in full-stack development, specializing in React, Node.js, and cloud architecture.",
        interest: "Mentoring junior developers, Islamic fintech solutions, and building scalable web applications for community organizations.",
        contribution: "I can help IMAN by providing technical mentorship to members, building web solutions for community initiatives, and sharing knowledge about modern software development practices.",
        employer: "Microsoft",
        linkedin: "https://linkedin.com/in/syedamirhusain"
      }
    })

    console.log('✅ Successfully added professional information!')
    console.log('Now check the member directory to see the professional details.')
    
  } catch (error) {
    console.error('❌ Error adding test data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addTestData()