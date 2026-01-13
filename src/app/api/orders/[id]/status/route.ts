import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/orders/[id]/status - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, notes } = await request.json()

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        statusHistory: {
          create: {
            status,
            notes,
            changedBy: session.user.id,
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('PATCH /api/orders/[id]/status error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
