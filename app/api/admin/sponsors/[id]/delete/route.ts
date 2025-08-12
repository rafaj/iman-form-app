import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateAdminRequest } from '@/lib/admin-auth'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    if (!validateAdminRequest(request)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const sponsorId = params.id

    if (!sponsorId) {
      return NextResponse.json({
        success: false,
        message: 'Sponsor ID is required'
      }, { status: 400 })
    }

    // Get the sponsor first to check if it has a logo file to delete
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId }
    })

    if (!sponsor) {
      return NextResponse.json({
        success: false,
        message: 'Sponsor not found'
      }, { status: 404 })
    }

    // Delete the logo file if it exists
    if (sponsor.logoUrl) {
      try {
        const logoPath = path.join(process.cwd(), 'public', sponsor.logoUrl)
        await fs.unlink(logoPath)
      } catch (fileError) {
        // File might not exist, continue with sponsor deletion
        console.warn('Could not delete logo file:', sponsor.logoUrl, fileError)
      }
    }

    // Delete the sponsor from database
    await prisma.sponsor.delete({
      where: { id: sponsorId }
    })

    return NextResponse.json({
      success: true,
      message: 'Sponsor deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting sponsor:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete sponsor'
    }, { status: 500 })
  }
}
