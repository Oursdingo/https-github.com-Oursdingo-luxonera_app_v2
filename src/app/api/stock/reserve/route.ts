import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reserveSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().min(1),
  quantity: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, sessionId, quantity } = reserveSchema.parse(body)

    // 1. Get product and check stock
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

    // 2. Calculate currently reserved stock for this product
    const now = new Date()
    const activeReservations = await prisma.stockReservation.findMany({
      where: {
        productId,
        expiresAt: { gt: now }, // Only non-expired reservations
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

    // 4. Check if enough stock is available
    if (quantity > availableStock) {
      return NextResponse.json(
        {
          error: 'Insufficient stock',
          available: availableStock,
          requested: quantity,
          productName: product.name,
        },
        { status: 400 }
      )
    }

    // 5. Check if user already has a reservation for this product
    const existingReservation = await prisma.stockReservation.findFirst({
      where: {
        productId,
        sessionId,
        expiresAt: { gt: now },
      },
    })

    // 6. Create or update reservation
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

    if (existingReservation) {
      // Update existing reservation
      const updatedReservation = await prisma.stockReservation.update({
        where: { id: existingReservation.id },
        data: {
          quantity: existingReservation.quantity + quantity,
          expiresAt, // Reset expiry time
        },
      })

      return NextResponse.json({
        success: true,
        reservation: updatedReservation,
        message: 'Reservation updated',
      })
    } else {
      // Create new reservation
      const newReservation = await prisma.stockReservation.create({
        data: {
          productId,
          sessionId,
          quantity,
          expiresAt,
        },
      })

      return NextResponse.json({
        success: true,
        reservation: newReservation,
        message: 'Stock reserved',
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/stock/reserve error:', error)
    return NextResponse.json(
      { error: 'Failed to reserve stock' },
      { status: 500 }
    )
  }
}
