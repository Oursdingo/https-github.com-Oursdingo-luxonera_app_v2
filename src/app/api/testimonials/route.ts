import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/testimonials - Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const type = searchParams.get('type')

    const where: any = { published: true }

    if (featured === 'true') {
      where.featured = true
    }
    if (type) {
      where.type = type.toUpperCase()
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({
      testimonials,
      count: testimonials.length,
    })
  } catch (error) {
    console.error('GET /api/testimonials error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Admin only
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const testimonialSchema = z.object({
      customerName: z.string().min(1),
      date: z.string(),
      type: z.enum(['CONVERSATION', 'PHOTO']),
      conversationImageUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      platform: z.enum(['WHATSAPP', 'INSTAGRAM', 'EMAIL']).optional(),
      featured: z.boolean().optional().default(false),
      published: z.boolean().optional().default(true),
    })

    const validatedData = testimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: validatedData.customerName,
        date: new Date(validatedData.date),
        type: validatedData.type,
        conversationImageUrl: validatedData.conversationImageUrl,
        imageUrl: validatedData.imageUrl,
        platform: validatedData.platform,
        featured: validatedData.featured,
        published: validatedData.published,
      },
    })

    return NextResponse.json({ testimonial }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/testimonials error:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
