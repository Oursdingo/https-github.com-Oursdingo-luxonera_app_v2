import { Watch } from './product'

export interface CartItem extends Watch {
  quantity: number
  reservationExpiresAt?: string // ISO date string for when the reservation expires
}

export interface CartState {
  items: CartItem[]
  addItem: (watch: Watch) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  refreshReservations: () => Promise<void> // Clean up expired items
}

export interface CheckoutData {
  items: Array<{
    name: string
    quantity: number
    price: number
    color?: string
    collection?: string
  }>
  total: number
  customerName?: string
  customerPhone?: string
  orderNumber?: string
  deliveryMessage?: string
  recipient?: {
    firstName: string
    lastName: string
    phone: string
  }
}
