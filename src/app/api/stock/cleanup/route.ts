import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const now = new Date()

    // Delete all expired reservations
    const result = await prisma.stockReservation.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} expired reservations`,
      count: result.count,
    })
  } catch (error) {
    console.error('POST /api/stock/cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup expired reservations' },
      { status: 500 }
    )
  }
}

// Allow GET as well for easier testing
export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // Get count of expired reservations
    const expiredCount = await prisma.stockReservation.count({
      where: {
        expiresAt: { lte: now },
      },
    })

    // Get count of active reservations
    const activeCount = await prisma.stockReservation.count({
      where: {
        expiresAt: { gt: now },
      },
    })

    return NextResponse.json({
      expired: expiredCount,
      active: activeCount,
      total: expiredCount + activeCount,
    })
  } catch (error) {
    console.error('GET /api/stock/cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to get cleanup stats' },
      { status: 500 }
    )
  }
}
