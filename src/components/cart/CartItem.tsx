'use client'

import Image from 'next/image'
import { CartItem as CartItemType } from '@/types/cart'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import ReservationTimer from './ReservationTimer'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, refreshReservations } = useCartStore()
  const shouldBypassOptimization = (url: string) =>
    url.startsWith('/uploads/') || url.startsWith('data:')
  const imageUrl = item.images.main || '/images/placeholder.jpg'

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(item.id)
    } else {
      await updateQuantity(item.id, newQuantity)
    }
  }

  const handleExpire = async () => {
    // Called when timer hits zero - refresh cart to remove expired items
    await refreshReservations()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 sm:py-6 first:pt-0 last:pb-0">
      <div className="flex gap-3 sm:gap-4 flex-1">
        {/* Image */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-neutral-50 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={shouldBypassOptimization(imageUrl)}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{item.name}</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mb-2">{item.collection}</p>
          <p className="font-semibold text-base sm:text-lg mb-2">{formatPrice(item.price)}</p>

          {/* Reservation Timer */}
          {item.reservationExpiresAt && (
            <ReservationTimer
              expiresAt={item.reservationExpiresAt}
              onExpire={handleExpire}
            />
          )}
        </div>
      </div>

      {/* Quantity & Remove */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3 sm:gap-0">
        <button
          onClick={() => removeItem(item.id)}
          className="text-neutral-400 hover:text-red-600 transition-colors p-1 order-2 sm:order-1"
          aria-label="Supprimer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1 sm:gap-2 border border-neutral-300 rounded order-1 sm:order-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-2 sm:px-3 py-1 hover:bg-neutral-100 transition-colors text-lg"
            aria-label="Diminuer"
          >
            -
          </button>
          <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-2 sm:px-3 py-1 hover:bg-neutral-100 transition-colors text-lg"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
