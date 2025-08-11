import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createProductionMembers() {
  console.log('Setting up production members...')

  // Add your actual IMAN members here
  const members = [
    {
      name: "Your Name Here",
      email: "your.email@example.com",
      active: true
    },
    // Add more existing members:
    // {
    //   name: "Member Name",
    //   email: "member@example.com", 
    //   active: true
    // },
  ]

  for (const memberData of members) {
    try {
      const member = await prisma.member.upsert({
        where: { email: memberData.email.toLowerCase() },
        update: {
          name: memberData.name,
          active: memberData.active
        },
        create: {
          name: memberData.name,
          email: memberData.email.toLowerCase(),
          active: memberData.active
        }
      })
      
      console.log(`✅ Member created/updated: ${member.name} (${member.email})`)
    } catch (error) {
      console.error(`❌ Failed to create member ${memberData.email}:`, error)
    }
  }

  const totalMembers = await prisma.member.count()
  console.log(`\n🎉 Production setup complete! Total members: ${totalMembers}`)
  
  await prisma.$disconnect()
}

createProductionMembers().catch((error) => {
  console.error('Error setting up production members:', error)
  process.exit(1)
})
