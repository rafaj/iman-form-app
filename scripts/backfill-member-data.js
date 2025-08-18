#!/usr/bin/env node

/**
 * Backfill script to copy professional information from approved applications 
 * to existing member records that don't have this data populated.
 * 
 * Run with: node scripts/backfill-member-data.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function backfillMemberData() {
  try {
    console.log('🔄 Starting backfill of member professional data...')
    
    // Find all members without professional data
    const membersNeedingData = await prisma.member.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: [
              { professionalQualification: null },
              { interest: null },
              { contribution: null },
              { employer: null },
              { linkedin: null }
            ]
          }
        ]
      }
    })

    console.log(`Found ${membersNeedingData.length} members that might need data backfill`)

    let updatedCount = 0

    for (const member of membersNeedingData) {
      // Find the approved application for this member
      const application = await prisma.application.findFirst({
        where: {
          applicantEmail: member.email,
          status: 'APPROVED'
        },
        orderBy: { approvedAt: 'desc' }
      })

      if (application) {
        // Update member with professional information from application
        const updateData = {}
        
        if (!member.professionalQualification && application.professionalQualification) {
          updateData.professionalQualification = application.professionalQualification
        }
        if (!member.interest && application.interest) {
          updateData.interest = application.interest
        }
        if (!member.contribution && application.contribution) {
          updateData.contribution = application.contribution
        }
        if (!member.employer && application.employer) {
          updateData.employer = application.employer
        }
        if (!member.linkedin && application.linkedin) {
          updateData.linkedin = application.linkedin
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.member.update({
            where: { id: member.id },
            data: updateData
          })
          
          console.log(`✅ Updated member ${member.name} (${member.email}) with professional data`)
          updatedCount++
        } else {
          console.log(`ℹ️  Member ${member.name} (${member.email}) already has all available data`)
        }
      } else {
        console.log(`⚠️  No approved application found for member ${member.name} (${member.email})`)
      }
    }

    console.log(`\n🎉 Backfill complete! Updated ${updatedCount} members with professional data.`)
    
  } catch (error) {
    console.error('❌ Error during backfill:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the backfill
backfillMemberData()