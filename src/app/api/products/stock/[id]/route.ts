import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/products/stock/[id] - Update stock quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stockQuantity } = await request.json()

    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return NextResponse.json(
        { error: 'Invalid stock quantity' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { slug: id },
      data: { stockQuantity },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('PATCH /api/products/stock/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}
