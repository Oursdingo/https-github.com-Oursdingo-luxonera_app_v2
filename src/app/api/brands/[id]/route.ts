import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        collections: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true, collections: true },
        },
      },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Marque non trouvee' },
        { status: 404 }
      )
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('GET /api/brands/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const brandSchema = z.object({
      name: z.string().min(1, 'Le nom est obligatoire'),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
    })

    const validatedData = brandSchema.parse(body)

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    })

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marque non trouvee' },
        { status: 404 }
      )
    }

    // Check if name is already used by another brand
    if (validatedData.name !== existingBrand.name) {
      const duplicateBrand = await prisma.brand.findFirst({
        where: {
          name: validatedData.name,
          id: { not: id },
        },
      })

      if (duplicateBrand) {
        return NextResponse.json(
          { error: 'Une marque avec ce nom existe deja' },
          { status: 400 }
        )
      }
    }

    // Generate new slug if name changed
    const slug = validatedData.name !== existingBrand.name
      ? validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      : existingBrand.slug

    const brand = await prisma.brand.update({
      where: { id },
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

    return NextResponse.json({ brand })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('PUT /api/brands/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE /api/brands/[id] - Delete brand (cascades to collections and products)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, collections: true },
        },
      },
    })

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marque non trouvee' },
        { status: 404 }
      )
    }

    // Delete brand (will cascade to collections and products due to schema)
    await prisma.brand.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Marque "${existingBrand.name}" supprimee avec ${existingBrand._count.collections} collection(s) et ${existingBrand._count.products} produit(s)`,
    })
  } catch (error) {
    console.error('DELETE /api/brands/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
