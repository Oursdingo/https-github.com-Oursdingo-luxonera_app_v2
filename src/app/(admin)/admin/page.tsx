'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Product {
  id: string
  name: string
  stockQuantity: number
  lowStockThreshold: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  customerName: string
  customerPhone: string
  createdAt: string
}

interface DashboardStats {
  totalProducts: number
  pendingOrders: number
  lowStockProducts: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const { data: productsData } = useSWR<{ products: Product[]; count: number }>(
    '/api/products',
    fetcher
  )
  const { data: ordersData } = useSWR<{ orders: Order[] }>(
    '/api/orders',
    fetcher
  )

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    if (productsData && ordersData) {
      const products = productsData.products
      const orders = ordersData.orders

      // Calculate low stock products
      const lowStock = products.filter(
        (p) => p.stockQuantity < p.lowStockThreshold
      ).length

      // Calculate pending orders
      const pending = orders.filter((o) => o.status === 'PENDING').length

      // Calculate monthly revenue (current month, DELIVERED orders only)
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyRevenue = orders
        .filter((o) => {
          const orderDate = new Date(o.createdAt)
          return (
            o.status === 'DELIVERED' && orderDate >= firstDayOfMonth
          )
        })
        .reduce((sum, o) => sum + o.total, 0)

      setStats({
        totalProducts: products.length,
        pendingOrders: pending,
        lowStockProducts: lowStock,
        monthlyRevenue,
      })
    }
  }, [productsData, ordersData])

  // Get recent orders (last 5)
  const recentOrders = ordersData?.orders.slice(0, 5) || []

  const statCards = [
    {
      title: 'Total Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      title: 'Commandes en Attente',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'bg-amber-500',
      link: '/admin/orders',
    },
    {
      title: 'Stock Faible',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/products',
    },
    {
      title: 'CA du Mois',
      value: `${stats.monthlyRevenue.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingUp,
      color: 'bg-accent-gold',
      link: '/admin/analytics',
    },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-neutral-100 text-neutral-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PROCESSING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-neutral-900">
          Tableau de bord
        </h1>
        <p className="text-neutral-600 mt-2">
          Vue d'ensemble de votre boutique Luxonera
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.link}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 mt-2">
                    {typeof card.value === 'number'
                      ? card.value.toLocaleString('fr-FR')
                      : card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-display font-semibold text-neutral-900">
            Dernières Commandes
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs sm:text-sm text-accent-gold hover:text-accent-gold/80 font-medium flex items-center gap-1"
          >
            <span className="hidden sm:inline">Voir tout</span>
            <span className="sm:hidden">Tout</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 text-sm sm:text-base">Aucune commande récente</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="px-4 sm:px-6 py-4 hover:bg-neutral-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs sm:text-sm font-medium text-neutral-900 truncate">
                      {order.orderNumber}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 truncate">
                    {order.customerName} • {order.customerPhone}
                  </p>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start">
                  <p className="text-sm font-medium text-neutral-900">
                    {order.total.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-xs text-neutral-500 sm:mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                Alerte Stock Faible
              </h3>
              <p className="text-red-700 mt-1">
                {stats.lowStockProducts} produit{stats.lowStockProducts > 1 ? 's' : ''}{' '}
                {stats.lowStockProducts > 1 ? 'ont' : 'a'} un stock inférieur au seuil
                d'alerte.
              </p>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-red-900 hover:text-red-700"
              >
                Voir les produits
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
