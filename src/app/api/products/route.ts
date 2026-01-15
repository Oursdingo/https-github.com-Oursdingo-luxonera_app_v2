import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/products - Public route to fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filters
    const collection = searchParams.get('collection')
    const brand = searchParams.get('brand')
    const inStock = searchParams.get('inStock')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const where: any = { published: true }

    if (collection) {
      where.collection = { slug: collection }
    }
    if (brand) {
      where.brand = { slug: brand }
    }
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 }
    }
    if (featured === 'true') {
      where.featured = true
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        collection: true,
      },
      orderBy: {
        [sortBy]: order,
      },
    })

    return NextResponse.json({
      products,
      count: products.length,
    })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Admin only, create product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validation schema
    const productSchema = z.object({
      name: z.string().min(1),
      description: z.string(),
      price: z.number().int().positive(),
      compareAtPrice: z.number().int().positive().optional(),
      brandId: z.string(),
      collectionId: z.string(),
      color: z.string().optional(),
      sku: z.string().optional(),
      mainImage: z.string(),
      galleryImages: z.array(z.string()).optional(),
      lifestyleImages: z.array(z.string()).optional(),
      specifications: z.any().optional(),
      stockQuantity: z.number().int().min(0).default(0),
      lowStockThreshold: z.number().int().min(0).default(5),
      trackInventory: z.boolean().default(true),
      allowBackorder: z.boolean().default(false),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
    })

    const validatedData = productSchema.parse(body)

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now()

    const initialStock = validatedData.stockQuantity || 0

    // Create product
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
        currency: 'FCFA',
        publishedAt: validatedData.published ? new Date() : null,
      },
      include: {
        brand: true,
        collection: true,
      },
    })

    // Create initial stock movement if stock > 0
    if (initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ENTRY',
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          reason: 'Stock initial lors de la création du produit',
          userName: session.user.name || 'Admin',
          userId: session.user.email,
        },
      })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
