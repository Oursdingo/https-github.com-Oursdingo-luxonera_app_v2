import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/products/stock - Create stock movement (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validation schema
    const stockMovementSchema = z.object({
      productId: z.string(),
      type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT', 'RETURN']),
      quantity: z.number().int(),
      reason: z.string().optional(),
      reference: z.string().optional(),
    })

    const validatedData = stockMovementSchema.parse(body)

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousStock = product.stockQuantity
    const newStock = previousStock + validatedData.quantity

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: `Stock insuffisant. Stock actuel: ${previousStock}` },
        { status: 400 }
      )
    }

    // Create stock movement and update product in transaction
    const [stockMovement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: validatedData.productId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          previousStock,
          newStock,
          reason: validatedData.reason,
          reference: validatedData.reference,
          userName: session.user.name || 'Admin',
          userId: session.user.email,
        },
      }),
      prisma.product.update({
        where: { id: validatedData.productId },
        data: { stockQuantity: newStock },
      }),
    ])

    return NextResponse.json({ stockMovement, product: updatedProduct }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('POST /api/products/stock error:', error)
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}

// GET /api/products/stock - Get all stock movements (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    if (productId) {
      where.productId = productId
    }
    if (type) {
      where.type = type
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            mainImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({ movements, count: movements.length })
  } catch (error) {
    console.error('GET /api/products/stock error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}
