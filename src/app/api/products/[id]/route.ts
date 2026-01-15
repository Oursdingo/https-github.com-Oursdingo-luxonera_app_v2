import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/products/[id] - Get single product (by slug or id)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find by slug first, then by id
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
      include: {
        brand: true,
        collection: true,
        stockMovements: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50, // Last 50 movements
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('GET /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (Admin only)
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

    // Validation schema
    const productSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().int().positive().optional(),
      compareAtPrice: z.number().int().positive().optional().nullable(),
      brandId: z.string().optional(),
      collectionId: z.string().optional(),
      color: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      mainImage: z.string().optional(),
      galleryImages: z.array(z.string()).optional(),
      lifestyleImages: z.array(z.string()).optional(),
      specifications: z.any().optional(),
      stockQuantity: z.number().int().min(0).optional(),
      lowStockThreshold: z.number().int().min(0).optional(),
      trackInventory: z.boolean().optional(),
      allowBackorder: z.boolean().optional(),
      featured: z.boolean().optional(),
      published: z.boolean().optional(),
    })

    const validatedData = productSchema.parse(body)

    // Check if product exists (by slug or id)
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Regenerate slug if name changed
    let updateData: any = { ...validatedData }

    if (validatedData.name && validatedData.name !== existingProduct.name) {
      updateData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now()
    }

    // Update publishedAt if published status changes
    if (validatedData.published !== undefined && validatedData.published !== existingProduct.published) {
      updateData.publishedAt = validatedData.published ? new Date() : null
    }

    // CASCADE LOGIC: If this is a featured product and published status is changing
    if (existingProduct.featured && validatedData.published !== undefined && validatedData.published !== existingProduct.published) {
      // Update all products in the same collection
      await prisma.$transaction(async (tx) => {
        // Update the featured product
        await tx.product.update({
          where: { id: existingProduct.id },
          data: updateData,
        })

        // Update all other products in the same collection
        await tx.product.updateMany({
          where: {
            collectionId: existingProduct.collectionId,
            id: { not: existingProduct.id },
          },
          data: {
            published: validatedData.published,
            publishedAt: validatedData.published ? new Date() : null,
          },
        })
      })

      // Fetch updated product
      const product = await prisma.product.findUnique({
        where: { id: existingProduct.id },
        include: {
          brand: true,
          collection: true,
        },
      })

      return NextResponse.json({
        product,
        cascadeApplied: true,
        message: `Publication ${validatedData.published ? 'activée' : 'désactivée'} pour toute la collection`
      })
    }

    // Normal update (no cascade)
    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data: updateData,
      include: {
        brand: true,
        collection: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('PUT /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
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

    // Check if product exists (by slug or id)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // CASCADE LOGIC: If this is a featured product, delete the entire collection
    if (product.featured) {
      // Deleting the collection will cascade delete all products (including the featured one)
      // thanks to onDelete: Cascade in the schema
      await prisma.collection.delete({
        where: { id: product.collectionId },
      })

      return NextResponse.json({
        message: 'Collection et tous ses produits supprimés avec succès',
        cascadeApplied: true,
      })
    }

    // Normal delete (non-featured product)
    await prisma.product.delete({
      where: { id: product.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error)

    // Check for foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce produit car il est lié à des commandes existantes' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
