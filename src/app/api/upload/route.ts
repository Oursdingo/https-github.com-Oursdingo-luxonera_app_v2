import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// POST /api/upload - Upload image (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (some browsers report empty or generic types)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
    const blockedTypes = ['image/heic', 'image/heif']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    const blockedExtensions = ['heic', 'heif']
    if (blockedTypes.includes(file.type) || blockedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'Format HEIC/HEIF non supporte. Exportez en JPG ou PNG.' },
        { status: 400 }
      )
    }
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'Type de fichier invalide. Utilisez JPG, PNG, WEBP ou AVIF.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5MB.' },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const typeToExtension: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
    }
    const safeExtension = validExtensions.includes(extension)
      ? extension
      : (typeToExtension[file.type] || 'jpg')
    const filename = `${timestamp}-${randomString}.${safeExtension}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
