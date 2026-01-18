import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/brands - Public
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { products: true, collections: true },
        },
      },
    })

    return NextResponse.json({
      brands,
      count: brands.length,
    })
  } catch (error) {
    console.error('GET /api/brands error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Admin only
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const brandSchema = z.object({
      name: z.string().min(1, 'Le nom est obligatoire'),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
    })

    const validatedData = brandSchema.parse(body)

    // Generate slug
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if brand already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { slug },
        ],
      },
    })

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Une marque avec ce nom existe deja' },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        logoUrl: validatedData.logoUrl || null,
      },
      include: {
        _count: {
          select: { products: true, collections: true },
        },
      },
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/brands error:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
