import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/orders - Admin only
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order from WhatsApp checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const orderSchema = z.object({
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
        })
      ),
      customerName: z.string().min(1),
      customerPhone: z.string().min(1),
      customerEmail: z.string().email().optional(),
      deliveryMessage: z.string().optional(),
      recipientFirstName: z.string().optional(),
      recipientLastName: z.string().optional(),
      recipientPhone: z.string().optional(),
    })

    const validatedData = orderSchema.parse(body)

    // Generate order number
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const orderCount = await prisma.order.count()
    const orderNumber = `LUX-${year}${month}${day}-${String(orderCount + 1).padStart(4, '0')}`

    // Calculate total and create order
    let subtotal = 0
    const orderItems = []

    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      // Check stock
      if (product.trackInventory && product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        )
      }

      const itemSubtotal = product.price * item.quantity

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productColor: product.color,
        productImage: product.mainImage,
        priceAtOrder: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      })

      subtotal += itemSubtotal
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        deliveryMessage: validatedData.deliveryMessage,
        recipientFirstName: validatedData.recipientFirstName,
        recipientLastName: validatedData.recipientLastName,
        recipientPhone: validatedData.recipientPhone,
        subtotal,
        total: subtotal, // Add delivery fee logic later
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            notes: 'Commande créée depuis le site web',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Decrement stock for each item
    for (const item of validatedData.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('POST /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
