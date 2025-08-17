import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateAdminRequest } from '@/lib/admin-auth'
import { del } from '@vercel/blob'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const { id: memberId } = await params

    if (!memberId) {
      return NextResponse.json({
        success: false,
        message: 'Member ID is required'
      }, { status: 400 })
    }

    // Get the member spotlight entry first to check if it has a logo to delete
    const member = await prisma.sponsor.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json({
        success: false,
        message: 'Member not found'
      }, { status: 404 })
    }

    // Delete the logo file if it exists
    if (member.logoUrl) {
      try {
        if (process.env.BLOB_READ_WRITE_TOKEN && member.logoUrl.startsWith('https://')) {
          // Delete from Vercel Blob in production
          await del(member.logoUrl)
        } else if (member.logoUrl.startsWith('/uploads/')) {
          // Delete local file in development
          const filePath = join(process.cwd(), 'public', member.logoUrl)
          await unlink(filePath)
        }
      } catch (fileError) {
        // File might not exist, continue with member deletion
        console.warn('Could not delete logo file:', member.logoUrl, fileError)
      }
    }

    // Delete the member from database
    await prisma.sponsor.delete({
      where: { id: memberId }
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed from spotlight successfully'
    })

  } catch (error) {
    console.error('Error deleting member spotlight entry:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to remove member from spotlight'
    }, { status: 500 })
  }
}