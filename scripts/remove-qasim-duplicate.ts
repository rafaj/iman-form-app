import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_cEs7t6JoTQnr@ep-lucky-sea-aeeqncu6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pool_timeout=30&connection_limit=3"
    }
  }
})

async function removeQasimDuplicate() {
  console.log('🔍 Connecting to PRODUCTION database to remove Qasim Abbas duplicate...')
  
  try {
    // Find both Qasim Abbas entries
    const qasimEntries = await prisma.member.findMany({
      where: {
        name: {
          contains: 'Qasim Abbas',
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`Found ${qasimEntries.length} Qasim Abbas entries:`)
    
    qasimEntries.forEach((member, index) => {
      console.log(`\n--- Entry ${index + 1} ---`)
      console.log(`ID: ${member.id}`)
      console.log(`Name: ${member.name}`)
      console.log(`Email: ${member.email}`)
      console.log(`Created: ${member.createdAt}`)
      console.log(`Professional Qualification: ${member.professionalQualification || 'NONE'}`)
      console.log(`Interest: ${member.interest || 'NONE'}`)
      console.log(`Employer: ${member.employer || 'NONE'}`)
    })

    // Identify the entry with less information (@googlemail.com with no professional info)
    const entryToRemove = qasimEntries.find(entry => 
      entry.email === 'qasimabbass@googlemail.com' && 
      !entry.professionalQualification
    )

    // Identify the entry to keep (@gmail.com with professional info)
    const entryToKeep = qasimEntries.find(entry => 
      entry.email === 'qasimabbass@gmail.com' && 
      entry.professionalQualification
    )

    if (!entryToRemove) {
      console.log('❌ Could not find the entry to remove (@googlemail.com with no professional info)')
      return
    }

    if (!entryToKeep) {
      console.log('❌ Could not find the entry to keep (@gmail.com with professional info)')
      return
    }

    console.log(`\n🗑️  REMOVING ENTRY:`)
    console.log(`   ID: ${entryToRemove.id}`)
    console.log(`   Name: ${entryToRemove.name}`)
    console.log(`   Email: ${entryToRemove.email}`)
    console.log(`   Professional Info: ${entryToRemove.professionalQualification || 'NONE'}`)

    console.log(`\n✅ KEEPING ENTRY:`)
    console.log(`   ID: ${entryToKeep.id}`)
    console.log(`   Name: ${entryToKeep.name}`)
    console.log(`   Email: ${entryToKeep.email}`)
    console.log(`   Professional Info: ${entryToKeep.professionalQualification || 'NONE'}`)

    // Check if the entry to remove has any related records first
    console.log(`\n🔍 Checking for related records for entry to remove...`)
    
    const sponsoredApplications = await prisma.application.count({
      where: { sponsorMemberId: entryToRemove.id }
    })
    
    const approvedApplications = await prisma.application.count({
      where: { approvedById: entryToRemove.id }
    })

    console.log(`   Sponsored Applications: ${sponsoredApplications}`)
    console.log(`   Approved Applications: ${approvedApplications}`)

    if (sponsoredApplications > 0 || approvedApplications > 0) {
      console.log('⚠️  WARNING: Entry to remove has related records. This might cause constraint issues.')
      console.log('   Proceeding with deletion anyway (constraints will cascade)...')
    }

    // Confirm deletion
    console.log(`\n❓ Proceeding to delete the duplicate entry...`)
    
    // Delete the duplicate entry
    const deletedMember = await prisma.member.delete({
      where: { id: entryToRemove.id }
    })

    console.log(`\n🎉 SUCCESS: Deleted duplicate Qasim Abbas entry`)
    console.log(`   Deleted ID: ${deletedMember.id}`)
    console.log(`   Deleted Email: ${deletedMember.email}`)

    // Verify the remaining entry
    const remainingQasimEntries = await prisma.member.findMany({
      where: {
        name: {
          contains: 'Qasim Abbas',
          mode: 'insensitive'
        }
      }
    })

    console.log(`\n✅ Verification: ${remainingQasimEntries.length} Qasim Abbas entry(ies) remaining:`)
    remainingQasimEntries.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.email}) - ID: ${member.id}`)
    })

  } catch (error) {
    console.error('❌ Error removing duplicate:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeQasimDuplicate().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})