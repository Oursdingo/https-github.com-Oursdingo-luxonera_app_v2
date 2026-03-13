import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/promo-codes/[id] - Admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { usages: true }
        }
      },
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      )
    }

    // Calculate total savings
    const totalSavings = promoCode.usages.reduce((sum, u) => sum + u.discountAmount, 0)

    return NextResponse.json({
      promoCode,
      stats: {
        totalUsages: promoCode._count.usages,
        totalSavings,
      }
    })
  } catch (error) {
    console.error('GET /api/promo-codes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    )
  }
}

// PUT /api/promo-codes/[id] - Admin only
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

    const promoCodeSchema = z.object({
      code: z.string().min(3).max(20).transform(val => val.toUpperCase().replace(/\s/g, '')).optional(),
      description: z.string().optional().nullable(),
      discountPercent: z.number().int().min(1).max(100).optional(),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional().nullable(),
      maxUses: z.number().int().positive().optional().nullable(),
      onePerCustomer: z.boolean().optional(),
      minOrderAmount: z.number().int().positive().optional().nullable(),
      active: z.boolean().optional(),
    })

    const validatedData = promoCodeSchema.parse(body)

    // Check if new code already exists (if changing code)
    if (validatedData.code) {
      const existing = await prisma.promoCode.findFirst({
        where: {
          code: validatedData.code,
          NOT: { id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ce code promo existe déjà' },
          { status: 400 }
        )
      }
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...validatedData,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : undefined,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : validatedData.expiresAt === null ? null : undefined,
      },
    })

    return NextResponse.json({ promoCode })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('PUT /api/promo-codes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    )
  }
}

// DELETE /api/promo-codes/[id] - Admin only
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

    await prisma.promoCode.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/promo-codes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    )
  }
}
