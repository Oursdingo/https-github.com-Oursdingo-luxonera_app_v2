import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Watch } from '@/types/product'
import { CartItem, CartState } from '@/types/cart'
import { toast } from 'sonner'
import { openWhatsAppChat } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import { getSessionId } from '@/lib/session'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (watch: Watch) => {
        const stockQuantity = watch.stockQuantity || 0

        // Scénario 3: Stock = 0 (Rupture de stock)
        if (stockQuantity === 0) {
          const message = `🛍️ COMMANDE LUXONERA\n\n` +
            `Je souhaite commander:\n\n` +
            `📦 Montre: ${watch.name}\n` +
            `   - Prix: ${formatPrice(watch.price)}\n\n` +
            `⚠️ Le produit est en rupture de stock sur le site.\n\n` +
            `✅ Merci de me confirmer la disponibilité et les modalités de livraison.`

          toast.error('Rupture de stock', {
            description: 'Ce produit est actuellement en rupture de stock - 0 unité disponible',
            action: {
              label: 'Commander via WhatsApp',
              onClick: () => openWhatsAppChat(message)
            },
            duration: 6000,
          })
          return
        }

        const existing = get().items.find((item) => item.id === watch.id)
        const currentQuantity = existing?.quantity || 0
        const newQuantity = currentQuantity + 1

        // Check if we're trying to add more than available stock
        if (newQuantity > stockQuantity) {
          const message = `🛍️ COMMANDE LUXONERA\n\n` +
            `Je souhaite commander:\n\n` +
            `📦 Montre: ${watch.name}\n` +
            `   - Prix: ${formatPrice(watch.price)}\n` +
            `   - Quantité souhaitée: ${newQuantity} unité(s)\n\n` +
            `⚠️ Seulement ${stockQuantity} unité${stockQuantity > 1 ? 's' : ''} disponible${stockQuantity > 1 ? 's' : ''} sur le site.\n\n` +
            `✅ Merci de me confirmer la disponibilité pour la quantité supplémentaire et les modalités de livraison.`

          toast.error('Stock insuffisant', {
            description: `Seulement ${stockQuantity} unité${stockQuantity > 1 ? 's' : ''} disponible${stockQuantity > 1 ? 's' : ''}`,
            action: {
              label: 'Commander via WhatsApp',
              onClick: () => openWhatsAppChat(message)
            },
            duration: 6000,
          })
          return
        }

        // Try to reserve the stock
        try {
          const sessionId = getSessionId()
          const response = await fetch('/api/stock/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: watch.id,
              sessionId,
              quantity: 1,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            // Stock reservation failed - show error with actual available stock
            if (data.error === 'Insufficient stock') {
              const message = `🛍️ COMMANDE LUXONERA\n\n` +
                `Je souhaite commander:\n\n` +
                `📦 Montre: ${watch.name}\n` +
                `   - Prix: ${formatPrice(watch.price)}\n` +
                `   - Quantité souhaitée: ${newQuantity} unité(s)\n\n` +
                `⚠️ Seulement ${data.available} unité${data.available > 1 ? 's' : ''} disponible${data.available > 1 ? 's' : ''} actuellement.\n\n` +
                `✅ Merci de me confirmer la disponibilité pour la quantité supplémentaire et les modalités de livraison.`

              toast.error('Stock insuffisant', {
                description: `Seulement ${data.available} unité${data.available > 1 ? 's' : ''} disponible${data.available > 1 ? 's' : ''} (d'autres clients ont réservé ce produit)`,
                action: {
                  label: 'Commander via WhatsApp',
                  onClick: () => openWhatsAppChat(message)
                },
                duration: 6000,
              })
            } else {
              toast.error('Erreur', {
                description: 'Impossible de réserver le produit. Veuillez réessayer.',
              })
            }
            return
          }

          // Reservation successful - update cart
          const reservationExpiresAt = data.reservation.expiresAt

          set((state) => {
            if (existing) {
              // Update existing item
              if (stockQuantity <= 5) {
                toast.warning('Stock limité', {
                  description: `⚠️ Plus que ${stockQuantity - currentQuantity} unité${(stockQuantity - currentQuantity) > 1 ? 's' : ''} disponible${(stockQuantity - currentQuantity) > 1 ? 's' : ''} après cet ajout`,
                  duration: 4000,
                })
              } else {
                toast.success('Quantité mise à jour', {
                  description: `${watch.name} a été ajouté à votre panier`,
                })
              }

              return {
                items: state.items.map((item) =>
                  item.id === watch.id
                    ? { ...item, quantity: newQuantity, reservationExpiresAt }
                    : item
                ),
              }
            } else {
              // Add new item
              if (stockQuantity <= 5) {
                toast.warning('Article ajouté', {
                  description: `${watch.name} ajouté (⚠️ seulement ${stockQuantity} en stock)`,
                  duration: 4000,
                })
              } else {
                toast.success('Article ajouté au panier', {
                  description: `${watch.name} a été ajouté à votre panier`,
                })
              }

              return {
                items: [...state.items, { ...watch, quantity: 1, reservationExpiresAt }],
              }
            }
          })
        } catch (error) {
          console.error('Error reserving stock:', error)
          toast.error('Erreur', {
            description: 'Impossible de réserver le produit. Veuillez réessayer.',
          })
        }
      },

      removeItem: async (id: string) => {
        const item = get().items.find((item) => item.id === id)
        if (!item) return

        // Release the reservation
        try {
          const sessionId = getSessionId()
          await fetch('/api/stock/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: id,
              sessionId,
            }),
          })
        } catch (error) {
          console.error('Error releasing stock:', error)
          // Continue with removal even if release fails
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))

        toast.error('Article retiré', {
          description: `${item.name} a été retiré de votre panier`,
        })
      },

      updateQuantity: async (id: string, quantity: number) => {
        const item = get().items.find((item) => item.id === id)
        if (!item) return

        // If quantity is 0 or less, remove the item
        if (quantity <= 0) {
          await get().removeItem(id)
          return
        }

        const stockQuantity = item.stockQuantity || 0
        const currentQuantity = item.quantity
        const quantityDiff = quantity - currentQuantity

        // Check if new quantity exceeds stock
        if (quantity > stockQuantity) {
          const message = `🛍️ COMMANDE LUXONERA\n\n` +
            `Je souhaite commander:\n\n` +
            `📦 Montre: ${item.name}\n` +
            `   - Prix: ${formatPrice(item.price)}\n` +
            `   - Quantité souhaitée: ${quantity} unité(s)\n\n` +
            `⚠️ Seulement ${stockQuantity} unité${stockQuantity > 1 ? 's' : ''} disponible${stockQuantity > 1 ? 's' : ''} sur le site.\n\n` +
            `✅ Merci de me confirmer la disponibilité pour la quantité supplémentaire et les modalités de livraison.`

          toast.error('Stock insuffisant', {
            description: `Seulement ${stockQuantity} unité${stockQuantity > 1 ? 's' : ''} disponible${stockQuantity > 1 ? 's' : ''}`,
            action: {
              label: 'Commander via WhatsApp',
              onClick: () => openWhatsAppChat(message)
            },
            duration: 6000,
          })
          return
        }

        try {
          const sessionId = getSessionId()

          if (quantityDiff > 0) {
            // Adding more - reserve additional stock
            const response = await fetch('/api/stock/reserve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: id,
                sessionId,
                quantity: quantityDiff,
              }),
            })

            const data = await response.json()

            if (!response.ok) {
              if (data.error === 'Insufficient stock') {
                const message = `🛍️ COMMANDE LUXONERA\n\n` +
                  `Je souhaite commander:\n\n` +
                  `📦 Montre: ${item.name}\n` +
                  `   - Prix: ${formatPrice(item.price)}\n` +
                  `   - Quantité souhaitée: ${quantity} unité(s)\n\n` +
                  `⚠️ Seulement ${data.available + currentQuantity} unité${(data.available + currentQuantity) > 1 ? 's' : ''} disponible${(data.available + currentQuantity) > 1 ? 's' : ''} actuellement.\n\n` +
                  `✅ Merci de me confirmer la disponibilité pour la quantité supplémentaire et les modalités de livraison.`

                toast.error('Stock insuffisant', {
                  description: `Impossible d'ajouter ${quantityDiff} unité${quantityDiff > 1 ? 's' : ''} supplémentaire${quantityDiff > 1 ? 's' : ''}`,
                  action: {
                    label: 'Commander via WhatsApp',
                    onClick: () => openWhatsAppChat(message)
                  },
                  duration: 6000,
                })
              }
              return
            }

            // Update with new expiry time
            set((state) => ({
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity, reservationExpiresAt: data.reservation.expiresAt }
                  : item
              ),
            }))
          } else {
            // Reducing quantity - release some stock
            await fetch('/api/stock/release', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: id,
                sessionId,
                quantity: Math.abs(quantityDiff),
              }),
            })

            set((state) => ({
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
            }))
          }

          // Show warning if stock is low
          if (stockQuantity <= 5 && quantity === stockQuantity) {
            toast.warning('Stock maximum', {
              description: `Vous avez ajouté toutes les unités disponibles (${stockQuantity})`,
              duration: 4000,
            })
          }
        } catch (error) {
          console.error('Error updating stock reservation:', error)
          toast.error('Erreur', {
            description: 'Impossible de mettre à jour la réservation. Veuillez réessayer.',
          })
        }
      },

      clearCart: async () => {
        const items = get().items

        // Release all reservations
        try {
          const sessionId = getSessionId()
          for (const item of items) {
            await fetch('/api/stock/release', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: item.id,
                sessionId,
              }),
            })
          }
        } catch (error) {
          console.error('Error releasing reservations:', error)
        }

        set({ items: [] })
      },

      refreshReservations: async () => {
        const items = get().items
        const now = new Date()

        // Check for expired reservations
        const expiredItems = items.filter((item) => {
          if (!item.reservationExpiresAt) return false
          return new Date(item.reservationExpiresAt) <= now
        })

        if (expiredItems.length > 0) {
          // Remove expired items from cart
          set((state) => ({
            items: state.items.filter((item) => {
              if (!item.reservationExpiresAt) return true
              return new Date(item.reservationExpiresAt) > now
            }),
          }))

          // Notify user
          if (expiredItems.length === 1) {
            toast.warning('Réservation expirée', {
              description: `${expiredItems[0].name} a été retiré du panier car la réservation a expiré.`,
              duration: 5000,
            })
          } else {
            toast.warning('Réservations expirées', {
              description: `${expiredItems.length} articles ont été retirés du panier car les réservations ont expiré.`,
              duration: 5000,
            })
          }
        }

        // Call cleanup API to remove expired reservations from database
        try {
          await fetch('/api/stock/cleanup', {
            method: 'POST',
          })
        } catch (error) {
          console.error('Error cleaning up expired reservations:', error)
        }
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'luxonera-cart',
    }
  )
)
