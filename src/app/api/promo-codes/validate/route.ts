import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/promo-codes/validate - Public (validate a promo code for checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validateSchema = z.object({
      code: z.string().min(1).transform(val => val.toUpperCase().replace(/\s/g, '')),
      orderAmount: z.number().int().positive(),
      customerPhone: z.string().min(1),
    })

    const { code, orderAmount, customerPhone } = validateSchema.parse(body)

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    })

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Code promo invalide' },
        { status: 400 }
      )
    }

    // Check if active
    if (!promoCode.active) {
      return NextResponse.json(
        { valid: false, error: 'Ce code promo n\'est plus actif' },
        { status: 400 }
      )
    }

    // Check validity dates
    const now = new Date()
    if (promoCode.startsAt && now < promoCode.startsAt) {
      return NextResponse.json(
        { valid: false, error: 'Ce code promo n\'est pas encore valide' },
        { status: 400 }
      )
    }

    if (promoCode.expiresAt && now > promoCode.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'Ce code promo a expiré' },
        { status: 400 }
      )
    }

    // Check max uses
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' },
        { status: 400 }
      )
    }

    // Check one per customer
    if (promoCode.onePerCustomer) {
      const existingUsage = await prisma.promoCodeUsage.findFirst({
        where: {
          promoCodeId: promoCode.id,
          customerPhone: customerPhone,
        },
      })

      if (existingUsage) {
        return NextResponse.json(
          { valid: false, error: 'Vous avez déjà utilisé ce code promo' },
          { status: 400 }
        )
      }
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Ce code promo nécessite un montant minimum de ${promoCode.minOrderAmount.toLocaleString('fr-FR')} FCFA`
        },
        { status: 400 }
      )
    }

    // Calculate discount
    const discountAmount = Math.floor(orderAmount * promoCode.discountPercent / 100)
    const finalAmount = orderAmount - discountAmount

    return NextResponse.json({
      valid: true,
      promoCode: {
        code: promoCode.code,
        discountPercent: promoCode.discountPercent,
        description: promoCode.description,
      },
      discount: {
        amount: discountAmount,
        percent: promoCode.discountPercent,
      },
      finalAmount,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Données invalides' },
        { status: 400 }
      )
    }
    console.error('POST /api/promo-codes/validate error:', error)
    return NextResponse.json(
      { valid: false, error: 'Erreur lors de la validation du code promo' },
      { status: 500 }
    )
  }
}
