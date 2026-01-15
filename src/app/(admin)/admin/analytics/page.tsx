'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingDown,
  Award,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AnalyticsData {
  period: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topBrands: Array<{
    brand: string
    sold: number
    revenue: number
    percentage: number
  }>
  topCollections: Array<{
    collection: string
    sold: number
    revenue: number
  }>
  topProducts: Array<{
    productId: string
    name: string
    brand: string
    collection: string
    image: string
    sold: number
    revenue: number
  }>
  salesOverTime: Array<{
    date: string
    revenue: number
    orders: number
  }>
  lowPerformers: Array<{
    id: string
    name: string
    brand: string
    collection: string
    price: number
    stockQuantity: number
  }>
  stockAlerts: Array<{
    id: string
    name: string
    brand: string
    collection: string
    stockQuantity: number
    lowStockThreshold: number
    status: 'out_of_stock' | 'critical' | 'low'
  }>
  statusDistribution: Record<string, number>
  stockMovementsByType: Array<{
    type: string
    count: number
    totalQuantity: number
  }>
  stockMovementsOverTime: Array<{
    date: string
    entries: number
    exits: number
    adjustments: number
    returns: number
  }>
  recentStockMovements: Array<{
    id: string
    productId: string
    productName: string
    productImage: string
    type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN'
    quantity: number
    previousStock: number
    newStock: number
    reason?: string
    reference?: string
    userName?: string
    createdAt: string
  }>
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30days')

  const { data, error, isLoading } = useSWR<AnalyticsData>(
    `/api/analytics?period=${period}`,
    fetcher
  )

  const periodOptions = [
    { value: '7days', label: '7 jours' },
    { value: '30days', label: '30 jours' },
    { value: 'month', label: 'Ce mois' },
    { value: '90days', label: '90 jours' },
    { value: 'year', label: 'Cette année' },
  ]

  const getStockStatusBadge = (status: string) => {
    const badges = {
      out_of_stock: 'bg-red-100 text-red-800',
      critical: 'bg-orange-100 text-orange-800',
      low: 'bg-yellow-100 text-yellow-800',
    }
    return badges[status as keyof typeof badges] || 'bg-neutral-100 text-neutral-800'
  }

  const getStockStatusLabel = (status: string) => {
    const labels = {
      out_of_stock: 'Rupture',
      critical: 'Critique',
      low: 'Faible',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return '📥'
      case 'EXIT':
        return '📤'
      case 'ADJUSTMENT':
        return '⚙️'
      case 'RETURN':
        return '↩️'
      default:
        return '•'
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return 'Entrée'
      case 'EXIT':
        return 'Sortie'
      case 'ADJUSTMENT':
        return 'Ajustement'
      case 'RETURN':
        return 'Retour'
      default:
        return type
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return 'text-green-600'
      case 'EXIT':
        return 'text-red-600'
      case 'ADJUSTMENT':
        return 'text-blue-600'
      case 'RETURN':
        return 'text-yellow-600'
      default:
        return 'text-neutral-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-medium">Erreur de chargement des analytiques</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-neutral-900">
            Analytiques & Statistiques
          </h1>
          <p className="text-neutral-600 mt-2">
            Analysez les performances de vos ventes
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === option.value
                  ? 'bg-accent-gold text-black'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Revenus Totaux</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {data.totalRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Commandes Livrées</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {data.totalOrders}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Panier Moyen</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {data.averageOrderValue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="bg-accent-gold p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Over Time Chart */}
          {data.salesOverTime.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-display font-semibold text-neutral-900 mb-6">
                Évolution des Ventes
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus']
                      }
                      return [value, 'Commandes']
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    name="Revenus"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Commandes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Brands */}
          {data.topBrands.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-display font-semibold text-neutral-900">
                  Top Marques
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Rang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Marque
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                        Vendus
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                        Revenus
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                        Part
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {data.topBrands.map((brand, index) => (
                      <tr key={brand.brand} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          {index < 3 ? (
                            <Award
                              className={`w-5 h-5 ${
                                index === 0
                                  ? 'text-yellow-500'
                                  : index === 1
                                  ? 'text-gray-400'
                                  : 'text-orange-600'
                              }`}
                            />
                          ) : (
                            <span className="text-neutral-600">#{index + 1}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900">
                          {brand.brand}
                        </td>
                        <td className="px-6 py-4 text-right text-neutral-900">
                          {brand.sold}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-neutral-900">
                          {brand.revenue.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm font-medium">
                            {brand.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Collections & Top Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Collections */}
            {data.topCollections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                <div className="px-6 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-display font-semibold text-neutral-900">
                    Top Collections
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {data.topCollections.map((collection, index) => (
                    <div
                      key={collection.collection}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-neutral-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {collection.collection}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {collection.sold} vendus
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-neutral-900">
                        {collection.revenue.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Products */}
            {data.topProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                <div className="px-6 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-display font-semibold text-neutral-900">
                    Top Produits
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {data.topProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4"
                    >
                      <span className="text-sm font-bold text-neutral-400">
                        #{index + 1}
                      </span>
                      <div className="relative w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {product.sold} vendus
                        </p>
                      </div>
                      <p className="text-sm font-medium text-neutral-900">
                        {product.revenue.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Movement Statistics */}
          {data.stockMovementsByType && data.stockMovementsByType.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-display font-semibold text-neutral-900">
                  Statistiques des Mouvements de Stock
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Suivi complet des entrées et sorties de stock
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {data.stockMovementsByType.map((movement) => (
                    <div
                      key={movement.type}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMovementIcon(movement.type)}</span>
                        <span className="text-sm font-medium text-neutral-600">
                          {getMovementLabel(movement.type)}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold ${getMovementColor(movement.type)}`}>
                        {movement.totalQuantity}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {movement.count} mouvement{movement.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stock Movements Over Time Chart */}
                {data.stockMovementsOverTime && data.stockMovementsOverTime.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-neutral-900 mb-4">
                      Évolution des Mouvements de Stock
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.stockMovementsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}`
                          }}
                        />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(label) => {
                            const date = new Date(label)
                            return date.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          }}
                        />
                        <Legend />
                        <Bar dataKey="entries" fill="#22c55e" name="Entrées" />
                        <Bar dataKey="exits" fill="#ef4444" name="Sorties" />
                        <Bar dataKey="adjustments" fill="#3b82f6" name="Ajustements" />
                        <Bar dataKey="returns" fill="#eab308" name="Retours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Stock Movements */}
          {data.recentStockMovements && data.recentStockMovements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-display font-semibold text-neutral-900">
                  Mouvements de Stock Récents
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Raison
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Par
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {data.recentStockMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                              {movement.productImage ? (
                                <Image
                                  src={movement.productImage}
                                  alt={movement.productName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-neutral-900 text-sm">
                              {movement.productName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getMovementIcon(movement.type)}</span>
                            <span className={`text-sm font-medium ${getMovementColor(movement.type)}`}>
                              {getMovementLabel(movement.type)}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${getMovementColor(movement.type)}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-neutral-600">
                          {movement.previousStock} → {movement.newStock}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                          {movement.reason || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {movement.userName || 'Admin'}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {formatDate(movement.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stock Alerts */}
          {data.stockAlerts.length > 0 && (
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200">
              <div className="px-6 py-4 border-b border-red-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-display font-semibold text-red-900">
                  Alertes Stock
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.stockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-white rounded-lg border border-red-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">
                            {alert.name}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {alert.brand} • {alert.collection}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusBadge(
                            alert.status
                          )}`}
                        >
                          {getStockStatusLabel(alert.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Stock actuel:</span>
                        <span className="font-bold text-red-600">
                          {alert.stockQuantity} / {alert.lowStockThreshold}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Low Performers */}
          {data.lowPerformers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-neutral-600" />
                <h2 className="text-lg font-display font-semibold text-neutral-900">
                  Produits à Faible Performance
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-neutral-600 mb-4">
                  Ces produits n&apos;ont enregistré aucune vente sur la période sélectionnée.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.lowPerformers.map((product) => (
                    <div
                      key={product.id}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {product.brand} • {product.collection}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="text-sm text-neutral-600">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
