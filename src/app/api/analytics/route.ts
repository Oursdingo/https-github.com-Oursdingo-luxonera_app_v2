import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/analytics - Admin only
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30days'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // 1. Total revenue and orders (DELIVERED only)
    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = deliveredOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // 2. Top Brands
    const orderItemsWithBrands = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'DELIVERED',
          createdAt: {
            gte: startDate,
          },
        },
      },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    })

    const brandStats = orderItemsWithBrands.reduce((acc, item) => {
      const brandName = item.product.brand.name
      if (!acc[brandName]) {
        acc[brandName] = {
          brand: brandName,
          sold: 0,
          revenue: 0,
        }
      }
      acc[brandName].sold += item.quantity
      acc[brandName].revenue += item.priceAtOrder * item.quantity
      return acc
    }, {} as Record<string, { brand: string; sold: number; revenue: number }>)

    const topBrands = Object.values(brandStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((brand, index) => ({
        ...brand,
        percentage: totalRevenue > 0 ? Math.round((brand.revenue / totalRevenue) * 100) : 0,
      }))

    // 3. Top Collections
    const orderItemsWithCollections = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'DELIVERED',
          createdAt: {
            gte: startDate,
          },
        },
      },
      include: {
        product: {
          include: {
            collection: true,
          },
        },
      },
    })

    const collectionStats = orderItemsWithCollections.reduce((acc, item) => {
      const collectionName = item.product.collection.name
      if (!acc[collectionName]) {
        acc[collectionName] = {
          collection: collectionName,
          sold: 0,
          revenue: 0,
        }
      }
      acc[collectionName].sold += item.quantity
      acc[collectionName].revenue += item.priceAtOrder * item.quantity
      return acc
    }, {} as Record<string, { collection: string; sold: number; revenue: number }>)

    const topCollections = Object.values(collectionStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // 4. Top Products (Best Sellers)
    const orderItemsGrouped = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: 'DELIVERED',
          createdAt: {
            gte: startDate,
          },
        },
      },
      _sum: {
        quantity: true,
        priceAtOrder: true,
      },
      orderBy: {
        _sum: {
          priceAtOrder: 'desc',
        },
      },
      take: 10,
    })

    const topProductIds = orderItemsGrouped.map((item) => item.productId)
    const productsDetails = await prisma.product.findMany({
      where: {
        id: {
          in: topProductIds,
        },
      },
      include: {
        brand: true,
        collection: true,
      },
    })

    const topProducts = orderItemsGrouped.map((item) => {
      const product = productsDetails.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        name: product?.name || 'Produit inconnu',
        brand: product?.brand.name || '',
        collection: product?.collection.name || '',
        image: product?.mainImage || '',
        sold: item._sum.quantity || 0,
        revenue: (item._sum.priceAtOrder || 0) * (item._sum.quantity || 0),
      }
    })

    // 5. Sales Over Time (daily for last 30 days)
    const salesByDate = deliveredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
        }
      }
      acc[date].revenue += order.total
      acc[date].orders += 1
      return acc
    }, {} as Record<string, { date: string; revenue: number; orders: number }>)

    const salesOverTime = Object.values(salesByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    // 6. Low Performing Products (published but 0 sales in period)
    const allPublishedProducts = await prisma.product.findMany({
      where: {
        published: true,
      },
      include: {
        brand: true,
        collection: true,
      },
    })

    const productIdsWithSales = new Set(orderItemsGrouped.map((item) => item.productId))
    const lowPerformers = allPublishedProducts
      .filter((product) => !productIdsWithSales.has(product.id))
      .slice(0, 10)
      .map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand.name,
        collection: product.collection.name,
        price: product.price,
        stockQuantity: product.stockQuantity,
      }))

    // 7. Stock Alerts
    const lowStockProducts = await prisma.product.findMany({
      where: {
        published: true,
        stockQuantity: {
          lt: prisma.product.fields.lowStockThreshold,
        },
      },
      include: {
        brand: true,
        collection: true,
      },
      orderBy: {
        stockQuantity: 'asc',
      },
      take: 20,
    })

    const stockAlerts = lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand.name,
      collection: product.collection.name,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      status:
        product.stockQuantity === 0
          ? 'out_of_stock'
          : product.stockQuantity < product.lowStockThreshold / 2
          ? 'critical'
          : 'low',
    }))

    // 8. Order Status Distribution
    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        status: true,
      },
    })

    const statusDistribution = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 9. Stock Movement Statistics
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            mainImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by type
    const stockMovementsByType = stockMovements.reduce((acc, movement) => {
      const type = movement.type
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          totalQuantity: 0,
        }
      }
      acc[type].count += 1
      acc[type].totalQuantity += Math.abs(movement.quantity)
      return acc
    }, {} as Record<string, { type: string; count: number; totalQuantity: number }>)

    // Stock movements over time (daily)
    const movementsByDate = stockMovements.reduce((acc, movement) => {
      const date = new Date(movement.createdAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          entries: 0,
          exits: 0,
          adjustments: 0,
          returns: 0,
        }
      }
      const absQty = Math.abs(movement.quantity)
      if (movement.type === 'ENTRY') acc[date].entries += absQty
      else if (movement.type === 'EXIT') acc[date].exits += absQty
      else if (movement.type === 'ADJUSTMENT') acc[date].adjustments += absQty
      else if (movement.type === 'RETURN') acc[date].returns += absQty
      return acc
    }, {} as Record<string, { date: string; entries: number; exits: number; adjustments: number; returns: number }>)

    const stockMovementsOverTime = Object.values(movementsByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    // Recent stock movements (last 20)
    const recentStockMovements = stockMovements.slice(0, 20).map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      productImage: movement.product.mainImage,
      type: movement.type,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      reason: movement.reason,
      reference: movement.reference,
      userName: movement.userName,
      createdAt: movement.createdAt.toISOString(),
    }))

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      topBrands,
      topCollections,
      topProducts,
      salesOverTime,
      lowPerformers,
      stockAlerts,
      statusDistribution,
      stockMovementsByType: Object.values(stockMovementsByType),
      stockMovementsOverTime,
      recentStockMovements,
    })
  } catch (error) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json(
      { error: 'Échec de récupération des analytiques' },
      { status: 500 }
    )
  }
}
