import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/push/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const subscriptionSchema = z.object({
      endpoint: z.string().url(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    })

    const validatedData = subscriptionSchema.parse(body)

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: validatedData.endpoint },
    })

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: validatedData.endpoint },
        data: {
          p256dh: validatedData.keys.p256dh,
          auth: validatedData.keys.auth,
          active: true,
          userId: session.user.id,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          endpoint: validatedData.endpoint,
          p256dh: validatedData.keys.p256dh,
          auth: validatedData.keys.auth,
          userId: session.user.id,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Subscribed to push notifications' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/push/subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    })

    return NextResponse.json({ success: true, message: 'Unsubscribed from push notifications' })
  } catch (error) {
    console.error('DELETE /api/push/subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

// GET /api/push/subscribe - Check subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id, active: true },
      select: { id: true, endpoint: true, createdAt: true },
    })

    return NextResponse.json({
      subscribed: subscriptions.length > 0,
      subscriptions,
    })
  } catch (error) {
    console.error('GET /api/push/subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}
