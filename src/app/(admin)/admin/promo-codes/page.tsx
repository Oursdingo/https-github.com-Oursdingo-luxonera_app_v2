'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, Edit, Trash2, Ticket, Save, X, Loader2, Copy, BarChart3, CheckCircle, XCircle, Package, Layers } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/admin/ConfirmModal'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PromoCode {
  id: string
  code: string
  description: string | null
  discountPercent: number
  startsAt: string
  expiresAt: string | null
  active: boolean
  maxUses: number | null
  usedCount: number
  onePerCustomer: boolean
  minOrderAmount: number | null
  productId: string | null
  collectionId: string | null
  product: { id: string; name: string } | null
  collection: { id: string; name: string } | null
  _count: {
    usages: number
  }
}

interface Product {
  id: string
  name: string
  color: string | null
  collection: { name: string } | null
}

interface Collection {
  id: string
  name: string
}

export default function PromoCodesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [promoCodeToDelete, setPromoCodeToDelete] = useState<PromoCode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercent: 10,
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    maxUses: '',
    onePerCustomer: false,
    minOrderAmount: '',
    active: true,
    restrictionType: 'all' as 'all' | 'product' | 'collection',
    productId: '',
    collectionId: '',
  })

  const { data, isLoading, mutate } = useSWR('/api/promo-codes', fetcher)
  const { data: productsData } = useSWR('/api/products', fetcher)
  const { data: collectionsData } = useSWR('/api/collections', fetcher)

  const products: Product[] = productsData?.products || []
  const collections: Collection[] = collectionsData?.collections || []

  const promoCodes: PromoCode[] = data?.promoCodes || []
  const stats = data?.stats || { total: 0, active: 0, totalUsages: 0 }

  const filteredPromoCodes = promoCodes.filter((p) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountPercent: 10,
      startsAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      maxUses: '',
      onePerCustomer: false,
      minOrderAmount: '',
      active: true,
      restrictionType: 'all',
      productId: '',
      collectionId: '',
    })
    setIsCreating(false)
    setEditingPromoCode(null)
  }

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode)
    setFormData({
      code: promoCode.code,
      description: promoCode.description || '',
      discountPercent: promoCode.discountPercent,
      startsAt: new Date(promoCode.startsAt).toISOString().split('T')[0],
      expiresAt: promoCode.expiresAt ? new Date(promoCode.expiresAt).toISOString().split('T')[0] : '',
      maxUses: promoCode.maxUses?.toString() || '',
      onePerCustomer: promoCode.onePerCustomer,
      minOrderAmount: promoCode.minOrderAmount?.toString() || '',
      active: promoCode.active,
      restrictionType: promoCode.productId ? 'product' : promoCode.collectionId ? 'collection' : 'all',
      productId: promoCode.productId || '',
      collectionId: promoCode.collectionId || '',
    })
    setIsCreating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      toast.error('Erreur', { description: 'Le code promo est obligatoire' })
      return
    }

    if (formData.discountPercent < 1 || formData.discountPercent > 100) {
      toast.error('Erreur', { description: 'Le pourcentage doit etre entre 1 et 100' })
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingPromoCode ? `/api/promo-codes/${editingPromoCode.id}` : '/api/promo-codes'
      const method = editingPromoCode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description || null,
          discountPercent: formData.discountPercent,
          startsAt: formData.startsAt,
          expiresAt: formData.expiresAt || null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          onePerCustomer: formData.onePerCustomer,
          minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount) : null,
          active: formData.active,
          productId: formData.restrictionType === 'product' ? formData.productId || null : null,
          collectionId: formData.restrictionType === 'collection' ? formData.collectionId || null : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(editingPromoCode ? 'Code promo modifie' : 'Code promo cree', {
        description: `${formData.code} a ete ${editingPromoCode ? 'modifie' : 'cree'} avec succes`
      })

      resetForm()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de sauvegarder le code promo'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (promoCode: PromoCode) => {
    try {
      const response = await fetch(`/api/promo-codes/${promoCode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promoCode.active }),
      })

      if (!response.ok) throw new Error('Erreur')

      toast.success(promoCode.active ? 'Code desactive' : 'Code active')
      mutate()
    } catch {
      toast.error('Erreur lors de la mise a jour')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copie dans le presse-papier')
  }

  const openDeleteModal = (promoCode: PromoCode) => {
    setPromoCodeToDelete(promoCode)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setPromoCodeToDelete(null)
  }

  const handleDelete = async () => {
    if (!promoCodeToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/promo-codes/${promoCodeToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Code promo supprime')
      closeDeleteModal()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer le code promo'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isMaxedOut = (promoCode: PromoCode) => {
    if (!promoCode.maxUses) return false
    return promoCode.usedCount >= promoCode.maxUses
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Codes Promo
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Gerez vos codes promotionnels et leurs restrictions
          </p>
        </div>
        {!isCreating && !editingPromoCode && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau code
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Total codes</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Codes actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Utilisations totales</p>
          <p className="text-2xl font-bold text-accent-gold">{stats.totalUsages}</p>
        </div>
        <Link
          href="/admin/promo-codes/analytics"
          className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
        >
          <p className="text-sm text-neutral-600">Voir les analytics</p>
          <div className="flex items-center gap-2 mt-1">
            <BarChart3 className="w-5 h-5 text-accent-gold" />
            <span className="text-sm font-medium text-accent-gold">Statistiques detaillees</span>
          </div>
        </Link>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingPromoCode) && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              {editingPromoCode ? `Modifier: ${editingPromoCode.code}` : 'Nouveau code promo'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold uppercase"
                  placeholder="LUXE20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reduction (%) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Promotion de bienvenue..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date de debut
                </label>
                <input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date d&apos;expiration
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                />
                <p className="text-xs text-neutral-500 mt-1">Laissez vide pour une validite illimitee</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre max d&apos;utilisations
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Illimite"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Montant minimum de commande (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Aucun minimum"
                />
              </div>
            </div>

            {/* Restriction produit / collection */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Restriction d&apos;application
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="restrictionType"
                      value="all"
                      checked={formData.restrictionType === 'all'}
                      onChange={() => setFormData({ ...formData, restrictionType: 'all', productId: '', collectionId: '' })}
                      className="accent-accent-gold"
                    />
                    <span className="text-sm text-neutral-700">Tous les produits</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="restrictionType"
                      value="product"
                      checked={formData.restrictionType === 'product'}
                      onChange={() => setFormData({ ...formData, restrictionType: 'product', collectionId: '' })}
                      className="accent-accent-gold"
                    />
                    <span className="flex items-center gap-1 text-sm text-neutral-700">
                      <Package className="w-4 h-4" /> Article spécifique
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="restrictionType"
                      value="collection"
                      checked={formData.restrictionType === 'collection'}
                      onChange={() => setFormData({ ...formData, restrictionType: 'collection', productId: '' })}
                      className="accent-accent-gold"
                    />
                    <span className="flex items-center gap-1 text-sm text-neutral-700">
                      <Layers className="w-4 h-4" /> Collection spécifique
                    </span>
                  </label>
                </div>
              </div>

              {formData.restrictionType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sélectionner l&apos;article
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold bg-white"
                    required={formData.restrictionType === 'product'}
                  >
                    <option value="">-- Choisir un article --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                        {product.color && product.color !== 'Main' ? ` - ${product.color}` : ''}
                        {product.collection ? ` (${product.collection.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.restrictionType === 'collection' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sélectionner la collection
                  </label>
                  <select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold bg-white"
                    required={formData.restrictionType === 'collection'}
                  >
                    <option value="">-- Choisir une collection --</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.onePerCustomer}
                  onChange={(e) => setFormData({ ...formData, onePerCustomer: e.target.checked })}
                  className="w-4 h-4 accent-accent-gold"
                />
                <span className="text-sm text-neutral-700">Une seule utilisation par client</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-accent-gold"
                />
                <span className="text-sm text-neutral-700">Code actif</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingPromoCode ? 'Modifier' : 'Creer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un code promo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Reduction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Utilisations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Validite</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredPromoCodes.map((promoCode) => {
                const expired = isExpired(promoCode.expiresAt)
                const maxedOut = isMaxedOut(promoCode)
                const isInactive = !promoCode.active || expired || maxedOut

                return (
                  <tr key={promoCode.id} className={isInactive ? 'bg-neutral-50 opacity-60' : ''}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">{promoCode.code}</span>
                        <button
                          onClick={() => copyCode(promoCode.code)}
                          className="p-1 hover:bg-neutral-100 rounded transition-colors"
                          title="Copier le code"
                        >
                          <Copy className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                      {promoCode.description && (
                        <p className="text-sm text-neutral-500 mt-1">{promoCode.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold text-accent-gold">-{promoCode.discountPercent}%</span>
                      {promoCode.minOrderAmount && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Min. {promoCode.minOrderAmount.toLocaleString('fr-FR')} FCFA
                        </p>
                      )}
                      {promoCode.product && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <Package className="w-3 h-3" /> {promoCode.product.name}
                        </p>
                      )}
                      {promoCode.collection && (
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {promoCode.collection.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">{promoCode.usedCount}</span>
                        {promoCode.maxUses && (
                          <span className="text-neutral-500">/ {promoCode.maxUses}</span>
                        )}
                      </div>
                      {promoCode.onePerCustomer && (
                        <p className="text-xs text-neutral-500 mt-1">1 par client</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p>
                          Du {new Date(promoCode.startsAt).toLocaleDateString('fr-FR')}
                        </p>
                        {promoCode.expiresAt ? (
                          <p className={expired ? 'text-red-600' : ''}>
                            Au {new Date(promoCode.expiresAt).toLocaleDateString('fr-FR')}
                          </p>
                        ) : (
                          <p className="text-neutral-500">Sans expiration</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Expire
                        </span>
                      ) : maxedOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Epuise
                        </span>
                      ) : promoCode.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(promoCode)}
                          className={`p-2 rounded-lg transition-colors ${
                            promoCode.active
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                          title={promoCode.active ? 'Desactiver' : 'Activer'}
                        >
                          {promoCode.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(promoCode)}
                          className="p-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(promoCode)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPromoCodes.length === 0 && (
          <div className="p-12 text-center">
            <Ticket className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {searchQuery ? 'Aucun code trouve' : 'Aucun code promo'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery
                ? 'Essayez avec un autre terme de recherche'
                : 'Creez votre premier code promo pour attirer des clients'}
            </p>
            {!searchQuery && !isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouveau code
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer le code promo"
        message={`Etes-vous sur de vouloir supprimer le code "${promoCodeToDelete?.code}" ? Cette action supprimera egalement l'historique d'utilisation.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
