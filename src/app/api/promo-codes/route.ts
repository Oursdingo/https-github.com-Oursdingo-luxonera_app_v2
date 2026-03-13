import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/promo-codes - Admin only (list all)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.active = true
    }

    const promoCodes = await prisma.promoCode.findMany({
      where,
      include: {
        _count: {
          select: { usages: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = {
      total: promoCodes.length,
      active: promoCodes.filter(p => p.active).length,
      totalUsages: promoCodes.reduce((sum, p) => sum + p.usedCount, 0),
    }

    return NextResponse.json({
      promoCodes,
      stats,
    })
  } catch (error) {
    console.error('GET /api/promo-codes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

// POST /api/promo-codes - Admin only
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const promoCodeSchema = z.object({
      code: z.string().min(3).max(20).transform(val => val.toUpperCase().replace(/\s/g, '')),
      description: z.string().optional().nullable(),
      discountPercent: z.coerce.number().int().min(1).max(100),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional().nullable(),
      maxUses: z.coerce.number().int().positive().optional().nullable(),
      onePerCustomer: z.boolean().optional().default(false),
      minOrderAmount: z.coerce.number().int().positive().optional().nullable(),
      active: z.boolean().optional().default(true),
    })

    const validatedData = promoCodeSchema.parse(body)

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: validatedData.code }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo existe déjà' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: validatedData.code,
        description: validatedData.description,
        discountPercent: validatedData.discountPercent,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : new Date(),
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        maxUses: validatedData.maxUses,
        onePerCustomer: validatedData.onePerCustomer,
        minOrderAmount: validatedData.minOrderAmount,
        active: validatedData.active,
      },
    })

    return NextResponse.json({ promoCode }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/promo-codes error:', error)
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}
