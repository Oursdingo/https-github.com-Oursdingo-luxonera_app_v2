'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  ShoppingCart,
  Search,
  ChevronRight,
  Package,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

interface OrderItem {
  id: string
  quantity: number
  priceAtOrder: number
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  subtotal: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  createdAt: string
  confirmedAt?: string
  deliveredAt?: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    '/api/orders',
    fetcher
  )

  const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmées' },
    { value: 'PROCESSING', label: 'En préparation' },
    { value: 'SHIPPED', label: 'Expédiées' },
    { value: 'DELIVERED', label: 'Livrées' },
    { value: 'CANCELLED', label: 'Annulées' },
  ]

  const getStatusBadge = (status: OrderStatus) => {
    const badges: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return badges[status]
  }

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PROCESSING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    }
    return labels[status]
  }

  // Filter orders
  const filteredOrders = data?.orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm)

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus

    return matchesSearch && matchesStatus
  }) || []

  // Count orders by status
  const statusCounts = data?.orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<OrderStatus, number>
  )

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-medium">Erreur de chargement des commandes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-neutral-900">
          Commandes
        </h1>
        <p className="text-neutral-600 mt-2">
          Gérez et suivez toutes les commandes de vos clients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusOptions.map((option) => {
          const count =
            option.value === 'all'
              ? data?.orders.length || 0
              : statusCounts?.[option.value as OrderStatus] || 0

          return (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                filterStatus === option.value
                  ? 'border-accent-gold bg-accent-gold/10'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <p className="text-2xl font-bold text-neutral-900">{count}</p>
              <p className="text-sm text-neutral-600 mt-1">{option.label}</p>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro, nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-neutral-600">
              {searchTerm
                ? 'Aucune commande ne correspond à votre recherche.'
                : filterStatus !== 'all'
                ? `Aucune commande avec le statut "${getStatusLabel(filterStatus as OrderStatus)}".`
                : 'Aucune commande pour le moment.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-mono text-sm font-bold text-neutral-900">
                      {order.orderNumber}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-neutral-900">
                        {order.customerName}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-600">{order.customerPhone}</span>
                    </div>
                    {order.customerEmail && (
                      <p className="text-sm text-neutral-600">{order.customerEmail}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Package className="w-4 h-4" />
                      <span>
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-neutral-900 mb-2">
                    {order.total.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <div className="mt-3 flex items-center justify-end gap-1 text-accent-gold text-sm font-medium">
                    Voir détails
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Orders Count */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="text-sm text-neutral-600 text-center">
          {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée
          {filteredOrders.length > 1 ? 's' : ''}
          {data && filteredOrders.length !== data.orders.length &&
            ` sur ${data.orders.length} au total`}
        </div>
      )}
    </div>
  )
}
