import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
