'use client'

import useSWR from 'swr'
import { ArrowLeft, Ticket, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PromoCodeWithUsages {
  id: string
  code: string
  description: string | null
  discountPercent: number
  usedCount: number
  active: boolean
  usages: {
    id: string
    customerPhone: string
    discountAmount: number
    createdAt: string
  }[]
  _count: {
    usages: number
  }
}

export default function PromoCodeAnalyticsPage() {
  const { data, isLoading } = useSWR('/api/promo-codes', fetcher)

  const promoCodes: PromoCodeWithUsages[] = data?.promoCodes || []

  // Calculate analytics
  const totalUsages = promoCodes.reduce((sum, p) => sum + p.usedCount, 0)
  const activeCodesCount = promoCodes.filter(p => p.active).length

  // Sort by usage count (most used first)
  const topCodes = [...promoCodes]
    .filter(p => p.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 10)

  // Get unique customers (by phone)
  const uniqueCustomers = new Set<string>()
  promoCodes.forEach(p => {
    if (p.usages) {
      p.usages.forEach(u => uniqueCustomers.add(u.customerPhone))
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/promo-codes"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Analytics Codes Promo
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Statistiques detaillees sur l&apos;utilisation des codes promo
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-gold/10 rounded-lg">
              <Ticket className="w-6 h-6 text-accent-gold" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total codes</p>
              <p className="text-2xl font-bold text-neutral-900">{promoCodes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Codes actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeCodesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Utilisations totales</p>
              <p className="text-2xl font-bold text-blue-600">{totalUsages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Clients uniques</p>
              <p className="text-2xl font-bold text-purple-600">{uniqueCustomers.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Codes */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-display font-semibold text-neutral-900">
            Codes les plus utilises
          </h2>
        </div>

        {topCodes.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucune utilisation
            </h3>
            <p className="text-neutral-600">
              Les codes promo n&apos;ont pas encore ete utilises
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {topCodes.map((promoCode, index) => (
              <div key={promoCode.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-accent-gold text-black' :
                  index === 1 ? 'bg-neutral-300 text-neutral-700' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{promoCode.code}</span>
                    <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-xs font-medium rounded">
                      -{promoCode.discountPercent}%
                    </span>
                    {!promoCode.active && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-xs font-medium rounded">
                        Inactif
                      </span>
                    )}
                  </div>
                  {promoCode.description && (
                    <p className="text-sm text-neutral-500 mt-1">{promoCode.description}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-900">{promoCode.usedCount}</p>
                  <p className="text-sm text-neutral-500">utilisations</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-display font-semibold text-neutral-900">
            Distribution des reductions
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[
              { range: '1-10%', count: promoCodes.filter(p => p.discountPercent >= 1 && p.discountPercent <= 10).length },
              { range: '11-20%', count: promoCodes.filter(p => p.discountPercent >= 11 && p.discountPercent <= 20).length },
              { range: '21-30%', count: promoCodes.filter(p => p.discountPercent >= 21 && p.discountPercent <= 30).length },
              { range: '31-50%', count: promoCodes.filter(p => p.discountPercent >= 31 && p.discountPercent <= 50).length },
              { range: '51-100%', count: promoCodes.filter(p => p.discountPercent >= 51).length },
            ].map(item => {
              const percentage = promoCodes.length > 0 ? (item.count / promoCodes.length) * 100 : 0

              return (
                <div key={item.range} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-neutral-600">{item.range}</div>
                  <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-gold rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-neutral-600 text-right">{item.count} codes</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
