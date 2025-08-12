import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateAdminRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!validateAdminRequest(request)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    // Get all sponsors
    const sponsors = await prisma.sponsor.findMany({
      orderBy: [
        { tier: 'asc' }, // Platinum first, then Gold, Silver, Bronze
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      sponsors
    })

  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sponsors'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!validateAdminRequest(request)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, website, tier, logoUrl } = body

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({
        success: false,
        message: 'Name and description are required'
      }, { status: 400 })
    }

    // Create new sponsor
    const sponsor = await prisma.sponsor.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        website: website?.trim() || null,
        tier: tier || 'BRONZE',
        logoUrl: logoUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      sponsor
    })

  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create sponsor'
    }, { status: 500 })
  }
}
