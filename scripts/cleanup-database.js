const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...')
    
    // Find the member to keep
    const keepMember = await prisma.member.findUnique({
      where: { email: 'jafar@jafar.com' }
    })
    
    if (!keepMember) {
      console.log('❌ Member jafar@jafar.com not found in database')
      console.log('Available members:')
      const allMembers = await prisma.member.findMany({
        select: { email: true, name: true }
      })
      allMembers.forEach(member => {
        console.log(`  - ${member.name} (${member.email})`)
      })
      return
    }
    
    console.log(`✅ Found member to keep: ${keepMember.name} (${keepMember.email})`)
    
    // Get count of members to delete
    const membersToDelete = await prisma.member.count({
      where: {
        email: {
          not: 'jafar@jafar.com'
        }
      }
    })
    
    console.log(`📊 Members to delete: ${membersToDelete}`)
    
    if (membersToDelete === 0) {
      console.log('✅ No members to delete. Database is already clean.')
      return
    }
    
    // Delete all applications first (due to foreign key constraints)
    console.log('🗑️  Deleting all applications...')
    const deletedApplications = await prisma.application.deleteMany({})
    console.log(`✅ Deleted ${deletedApplications.count} applications`)
    
    // Delete all members except jafar@jafar.com
    console.log('🗑️  Deleting other members...')
    const deletedMembers = await prisma.member.deleteMany({
      where: {
        email: {
          not: 'jafar@jafar.com'
        }
      }
    })
    console.log(`✅ Deleted ${deletedMembers.count} members`)
    
    // Verify final state
    const remainingMembers = await prisma.member.findMany({
      select: { name: true, email: true }
    })
    
    console.log('\n🎉 Database cleanup completed!')
    console.log('Remaining members:')
    remainingMembers.forEach(member => {
      console.log(`  ✅ ${member.name} (${member.email})`)
    })
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDatabase()
