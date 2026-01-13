'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import CartItem from '@/components/cart/CartItem'
import WhatsAppCheckout from '@/components/cart/WhatsAppCheckout'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const refreshReservations = useCartStore((state) => state.refreshReservations)

  // Refresh reservations when page loads and every minute
  useEffect(() => {
    refreshReservations()

    const interval = setInterval(() => {
      refreshReservations()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [refreshReservations])

  return (
    <div className="pt-24 md:pt-32 pb-12 md:pb-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display mb-8 md:mb-12">Votre Panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <svg
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-xl md:text-2xl font-display mb-3 md:mb-4">Votre panier est vide</h2>
            <p className="text-neutral-600 mb-6 md:mb-8 text-sm md:text-base">
              Découvrez notre collection de montres de luxe
            </p>
            <Link href="/catalog">
              <Button variant="primary" size="lg">
                Découvrir la Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-display mb-4 md:mb-6">
                  Articles ({items.length})
                </h2>
                <div className="divide-y divide-neutral-200">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="hidden md:block">
                <Link href="/catalog">
                  <Button variant="ghost">
                    ← Continuer mes achats
                  </Button>
                </Link>
              </div>
            </div>

            {/* Checkout */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <WhatsAppCheckout />
            </div>

            {/* Continue Shopping - Mobile */}
            <div className="md:hidden lg:col-span-3">
              <Link href="/catalog">
                <Button variant="ghost" className="w-full">
                  ← Continuer mes achats
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
