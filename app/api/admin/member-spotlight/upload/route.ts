import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-auth'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import { join } from 'path'

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
    const filename = `${timestamp}_${sanitizedName}`
    
    let logoUrl: string

    // Check if we're in production with Vercel Blob or development
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob in production
      const blobFilename = `member-spotlight/${filename}`
      const blob = await put(blobFilename, file, {
        access: 'public',
      })
      logoUrl = blob.url
    } else {
      // Use local file storage in development
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'member-spotlight')
      await writeFile(join(uploadsDir, filename), buffer).catch(async (error) => {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, create it
          const { mkdir } = await import('fs/promises')
          await mkdir(uploadsDir, { recursive: true })
          await writeFile(join(uploadsDir, filename), buffer)
        } else {
          throw error
        }
      })
      
      logoUrl = `/uploads/member-spotlight/${filename}`
    }

    return NextResponse.json({
      success: true,
      logoUrl
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file'
    }, { status: 500 })
  }
}