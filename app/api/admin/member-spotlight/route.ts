import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    // Get all sponsors (member spotlight entries)
    const sponsors = await prisma.sponsor.findMany({
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      sponsors
    })

  } catch (error) {
    console.error('Error fetching member spotlight:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch member spotlight'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = validateAdminRequest(request)
    if (!adminSession) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, website, logoUrl } = body

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({
        success: false,
        message: 'Name and description are required'
      }, { status: 400 })
    }

    // Create new member spotlight entry
    const sponsor = await prisma.sponsor.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        website: website?.trim() || null,
        tier: 'BRONZE', // Default tier for backward compatibility
        logoUrl: logoUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      sponsor
    })

  } catch (error) {
    console.error('Error creating member spotlight entry:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create member spotlight entry'
    }, { status: 500 })
  }
}