import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    // 1. Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // 2. Calculate currently reserved stock (only non-expired)
    const now = new Date()
    const activeReservations = await prisma.stockReservation.findMany({
      where: {
        productId,
        expiresAt: { gt: now },
      },
      select: {
        quantity: true,
      },
    })

    const totalReserved = activeReservations.reduce(
      (sum, r) => sum + r.quantity,
      0
    )

    // 3. Calculate available stock
    const availableStock = product.stockQuantity - totalReserved

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      totalStock: product.stockQuantity,
      reserved: totalReserved,
      available: Math.max(0, availableStock), // Never negative
      activeReservations: activeReservations.length,
    })
  } catch (error) {
    console.error('GET /api/stock/available/[productId] error:', error)
    return NextResponse.json(
      { error: 'Failed to check stock availability' },
      { status: 500 }
    )
  }
}
