import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const releaseSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().min(1),
  quantity: z.number().int().positive().optional(), // If not provided, release all
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, sessionId, quantity } = releaseSchema.parse(body)

    const now = new Date()

    // Find active reservation for this user and product
    const reservation = await prisma.stockReservation.findFirst({
      where: {
        productId,
        sessionId,
        expiresAt: { gt: now },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'No active reservation found' },
        { status: 404 }
      )
    }

    // If quantity is specified, reduce the reservation by that amount
    if (quantity !== undefined) {
      if (quantity >= reservation.quantity) {
        // Release entire reservation
        await prisma.stockReservation.delete({
          where: { id: reservation.id },
        })

        return NextResponse.json({
          success: true,
          message: 'Reservation fully released',
          released: reservation.quantity,
        })
      } else {
        // Reduce reservation quantity
        const updatedReservation = await prisma.stockReservation.update({
          where: { id: reservation.id },
          data: {
            quantity: reservation.quantity - quantity,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Reservation partially released',
          released: quantity,
          remaining: updatedReservation.quantity,
        })
      }
    } else {
      // Release entire reservation
      await prisma.stockReservation.delete({
        where: { id: reservation.id },
      })

      return NextResponse.json({
        success: true,
        message: 'Reservation fully released',
        released: reservation.quantity,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/stock/release error:', error)
    return NextResponse.json(
      { error: 'Failed to release stock' },
      { status: 500 }
    )
  }
}
