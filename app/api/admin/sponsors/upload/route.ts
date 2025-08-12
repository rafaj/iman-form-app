import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!validateAdminRequest(request)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('logo') as unknown as File

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded'
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Please upload a JPEG, PNG, WebP, or SVG image.'
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'File too large. Please upload an image smaller than 5MB.'
      }, { status: 400 })
    }

    // Create unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `sponsors/${timestamp}_${sanitizedName}`
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      logoUrl: blob.url
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file'
    }, { status: 500 })
  }
}
