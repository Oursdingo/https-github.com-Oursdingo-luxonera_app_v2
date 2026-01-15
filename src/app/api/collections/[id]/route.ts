import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/collections/[id] - Get single collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            brand: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('GET /api/collections/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

// PUT /api/collections/[id] - Update collection (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        featured: body.featured,
        imageUrl: body.imageUrl,
      },
    })

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('PUT /api/collections/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

// DELETE /api/collections/[id] - Delete collection and all its products (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete collection and all related products in transaction
    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    await prisma.collection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/collections/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
