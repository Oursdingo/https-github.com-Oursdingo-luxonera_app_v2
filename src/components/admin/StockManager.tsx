'use client'

import { useState } from 'react'
import { mutate } from 'swr'

interface StockMovement {
  id: string
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  reference?: string
  userName?: string
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug?: string
  stockQuantity: number
  lowStockThreshold: number
  stockMovements?: StockMovement[]
}

interface StockManagerProps {
  product: Product
  slug?: string
}

export default function StockManager({ product, slug }: StockManagerProps) {
  const [isAddingStock, setIsAddingStock] = useState(false)
  const [movementType, setMovementType] = useState<'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN'>('ENTRY')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isLowStock = product.stockQuantity <= product.lowStockThreshold

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!quantity || parseInt(quantity) === 0) {
      setError('Veuillez entrer une quantité valide')
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate the actual quantity change based on movement type
      let quantityChange = parseInt(quantity)
      if (movementType === 'EXIT' && quantityChange > 0) {
        quantityChange = -quantityChange // Exit is negative
      } else if (movementType === 'ENTRY' && quantityChange < 0) {
        quantityChange = Math.abs(quantityChange) // Entry is always positive
      }

      const response = await fetch('/api/products/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          type: movementType,
          quantity: quantityChange,
          reason: reason || undefined,
          reference: reference || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création du mouvement de stock')
      }

      // Refresh the product data (both by ID and slug if provided)
      await mutate(`/api/products/${product.id}`)
      if (slug) {
        await mutate(`/api/products/${slug}`)
      }
      // Also refresh the products list
      await mutate('/api/products')

      // Reset form
      setQuantity('')
      setReason('')
      setReference('')
      setIsAddingStock(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-200 p-4">
        <h3 className="text-lg font-semibold text-neutral-900">Gestion du stock</h3>
      </div>

      {/* Current Stock */}
      <div className="p-4 border-b border-neutral-200">
        <div className="text-center">
          <div className="text-sm text-neutral-600 mb-1">Stock actuel</div>
          <div className={`text-4xl font-bold ${isLowStock ? 'text-red-600' : 'text-neutral-900'}`}>
            {product.stockQuantity}
          </div>
          {isLowStock && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              ⚠️ Stock faible (seuil: {product.lowStockThreshold})
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Button */}
      <div className="p-4 border-b border-neutral-200">
        {!isAddingStock ? (
          <button
            onClick={() => setIsAddingStock(true)}
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            + Ajouter un mouvement
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Type de mouvement
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="ENTRY">📥 Entrée</option>
                <option value="EXIT">📤 Sortie</option>
                <option value="ADJUSTMENT">⚙️ Ajustement</option>
                <option value="RETURN">↩️ Retour</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Quantité {movementType === 'EXIT' ? '(sortie)' : '(entrée)'}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: 10"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Raison (optionnel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Ex: Réception fournisseur, Vente, Correction inventaire..."
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: BC-2024-001, Commande #123..."
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingStock(false)
                  setError('')
                  setQuantity('')
                  setReason('')
                  setReference('')
                }}
                className="flex-1 bg-neutral-200 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-300 transition-colors text-sm"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stock Movement History */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">
          Historique des mouvements
        </h4>

        {!product.stockMovements || product.stockMovements.length === 0 ? (
          <div className="text-sm text-neutral-500 text-center py-4">
            Aucun mouvement de stock enregistré
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {product.stockMovements.map((movement) => (
              <div
                key={movement.id}
                className="border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors"
              >
                {/* Movement Type & Quantity */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMovementIcon(movement.type)}</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {getMovementLabel(movement.type)}
                      </div>
                      <div className={`text-xs font-semibold ${getMovementColor(movement.type)}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity} unité(s)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500">Stock</div>
                    <div className="text-sm font-medium text-neutral-900">
                      {movement.previousStock} → {movement.newStock}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {movement.reason && (
                  <div className="text-xs text-neutral-600 mb-1 bg-neutral-50 rounded px-2 py-1">
                    {movement.reason}
                  </div>
                )}

                {/* Reference */}
                {movement.reference && (
                  <div className="text-xs text-neutral-500 mb-1">
                    Réf: {movement.reference}
                  </div>
                )}

                {/* User & Date */}
                <div className="flex items-center justify-between text-xs text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
                  <span>{movement.userName || 'Admin'}</span>
                  <span>{formatDate(movement.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
