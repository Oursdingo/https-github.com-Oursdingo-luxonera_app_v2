'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MessageSquare,
  Gift,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

interface Product {
  id: string
  name: string
  mainImage: string
  galleryImages: string[]
}

interface OrderItem {
  id: string
  quantity: number
  priceAtOrder: number
  color?: string
  product: Product
}

interface StatusHistory {
  id: string
  status: OrderStatus
  notes?: string
  createdAt: string
  changedBy?: {
    name: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryMessage?: string
  recipientFirstName?: string
  recipientLastName?: string
  recipientPhone?: string
  createdAt: string
  confirmedAt?: string
  deliveredAt?: string
  items: OrderItem[]
  statusHistory: StatusHistory[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusNotes, setStatusNotes] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)

  const { data, error, isLoading } = useSWR<Order>(
    orderId ? `/api/orders/${orderId}` : null,
    fetcher
  )

  const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'PENDING', label: 'En attente', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Confirmée', color: 'blue' },
    { value: 'PROCESSING', label: 'En préparation', color: 'purple' },
    { value: 'SHIPPED', label: 'Expédiée', color: 'indigo' },
    { value: 'DELIVERED', label: 'Livrée', color: 'green' },
    { value: 'CANCELLED', label: 'Annulée', color: 'red' },
  ]

  const getStatusBadge = (status: OrderStatus) => {
    const option = statusOptions.find((o) => o.value === status)
    if (!option) return ''
    return `bg-${option.color}-100 text-${option.color}-800`
  }

  const getStatusLabel = (status: OrderStatus) => {
    return statusOptions.find((o) => o.value === status)?.label || status
  }

  const handleStatusChange = async (newStatus: OrderStatus, notes: string) => {
    setIsUpdatingStatus(true)

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      if (!response.ok) {
        throw new Error('Échec de la mise à jour')
      }

      toast.success('Statut mis à jour', {
        description: `Commande passée à "${getStatusLabel(newStatus)}"`,
      })

      // Revalidate the order data
      mutate(`/api/orders/${orderId}`)
      setShowStatusModal(false)
      setStatusNotes('')
      setSelectedStatus(null)
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de mettre à jour le statut.',
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-medium">Commande introuvable</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90"
          >
            Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-neutral-900">
              Commande {data.orderNumber}
            </h1>
            <p className="text-neutral-600 mt-1">
              Passée le{' '}
              {new Date(data.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
            data.status
          )}`}
        >
          {getStatusLabel(data.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-display font-semibold text-neutral-900">
                Articles commandés
              </h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {data.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.mainImage ? (
                      <Image
                        src={item.product.mainImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {item.product.name}
                    </p>
                    {item.color && (
                      <p className="text-sm text-neutral-600">Couleur: {item.color}</p>
                    )}
                    <p className="text-sm text-neutral-600">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">
                      {item.priceAtOrder.toLocaleString('fr-FR')} FCFA
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-neutral-600">
                        {(item.priceAtOrder / item.quantity).toLocaleString('fr-FR')}{' '}
                        FCFA/unité
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Sous-total</span>
                  <span className="text-neutral-900">
                    {data.subtotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Frais de livraison</span>
                  <span className="text-neutral-900">
                    {data.deliveryFee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                  <span className="text-neutral-900">Total</span>
                  <span className="text-neutral-900">
                    {data.total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-display font-semibold text-neutral-900">
                Historique
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0
                            ? 'bg-accent-gold'
                            : 'bg-neutral-200'
                        }`}
                      >
                        <CheckCircle
                          className={`w-5 h-5 ${
                            index === 0 ? 'text-black' : 'text-neutral-600'
                          }`}
                        />
                      </div>
                      {index < data.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-neutral-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-neutral-900">
                          {getStatusLabel(history.status)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {new Date(history.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-neutral-600">{history.notes}</p>
                      )}
                      {history.changedBy && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Par {history.changedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-display font-semibold text-neutral-900">
                Informations client
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Nom</p>
                  <p className="font-medium text-neutral-900">{data.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-600">Téléphone</p>
                  <a
                    href={`tel:${data.customerPhone}`}
                    className="font-medium text-accent-gold hover:underline"
                  >
                    {data.customerPhone}
                  </a>
                </div>
              </div>
              {data.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">Email</p>
                    <a
                      href={`mailto:${data.customerEmail}`}
                      className="font-medium text-accent-gold hover:underline break-all"
                    >
                      {data.customerEmail}
                    </a>
                  </div>
                </div>
              )}
              {data.deliveryMessage && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">Message de livraison</p>
                    <p className="text-neutral-900 text-sm mt-1">
                      {data.deliveryMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gift Info */}
          {(data.recipientFirstName || data.recipientLastName || data.recipientPhone) && (
            <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200">
              <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-display font-semibold text-amber-900">
                  C'est un cadeau
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {(data.recipientFirstName || data.recipientLastName) && (
                  <div>
                    <p className="text-sm text-amber-700">Destinataire</p>
                    <p className="font-medium text-amber-900">
                      {[data.recipientFirstName, data.recipientLastName].filter(Boolean).join(' ')}
                    </p>
                  </div>
                )}
                {data.recipientPhone && (
                  <div>
                    <p className="text-sm text-amber-700">Téléphone</p>
                    <p className="font-medium text-amber-900">{data.recipientPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Status */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-display font-semibold text-neutral-900">
                Changer le statut
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {statusOptions
                .filter((option) => option.value !== data.status)
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value)
                      setShowStatusModal(true)
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 border-${option.color}-200 bg-${option.color}-50 hover:bg-${option.color}-100 text-${option.color}-900 font-medium transition-colors text-left`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                Changer le statut en "{getStatusLabel(selectedStatus)}"
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                  placeholder="Ajouter des notes sur ce changement de statut..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setStatusNotes('')
                    setSelectedStatus(null)
                  }}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleStatusChange(selectedStatus, statusNotes)}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Mise à jour...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
