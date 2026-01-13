import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/collections - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const collections = await prisma.collection.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: { products: true },
        },
        ...(includeProducts && {
          products: {
            select: {
              id: true,
              name: true,
              featured: true,
              published: true,
              mainImage: true,
            },
          },
        }),
      },
    })

    return NextResponse.json({
      collections,
      count: collections.length,
    })
  } catch (error) {
    console.error('GET /api/collections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

// POST /api/collections - Create collection with featured product and watches (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collection: collectionData, featuredProduct, watches } = body

    // Validation
    if (!collectionData.name || !featuredProduct || !watches || watches.length === 0) {
      return NextResponse.json(
        { error: 'Collection name, featured product, and at least one watch are required' },
        { status: 400 }
      )
    }

    // Create collection with products in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the collection
      const newCollection = await tx.collection.create({
        data: {
          name: collectionData.name,
          slug: collectionData.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          description: collectionData.description || null,
          featured: collectionData.featured || false,
          order: 0,
        },
      })

      // 2. Create the featured product (image de la collection)
      const createdFeaturedProduct = await tx.product.create({
        data: {
          name: featuredProduct.name,
          slug: `${newCollection.slug}-featured`,
          description: featuredProduct.description || 'Image représentative de la collection',
          price: 0, // No price for featured product
          brandId: featuredProduct.brandId,
          collectionId: newCollection.id,
          mainImage: featuredProduct.mainImage,
          galleryImages: featuredProduct.galleryImages || [],
          featured: true,
          published: featuredProduct.published !== false,
          stockQuantity: 0,
          trackInventory: false,
        },
      })

      // 3. Create the watches
      const createdWatches = await Promise.all(
        watches.map((watch: any, index: number) =>
          tx.product.create({
            data: {
              name: watch.name,
              slug: `${newCollection.slug}-${index + 1}-${watch.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')}`,
              description: watch.description,
              price: watch.price,
              brandId: watch.brandId,
              collectionId: newCollection.id,
              color: watch.color || null,
              mainImage: watch.mainImage,
              galleryImages: watch.galleryImages || [],
              featured: false,
              published: watch.published !== false,
              stockQuantity: watch.stockQuantity || 0,
            },
          })
        )
      )

      return {
        collection: newCollection,
        featuredProduct: createdFeaturedProduct,
        watches: createdWatches,
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/collections error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create collection' },
      { status: 500 }
    )
  }
}
