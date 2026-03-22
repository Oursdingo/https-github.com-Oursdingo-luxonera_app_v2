'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Plus, Search, Edit, Trash2, Ticket, Save, X, Loader2, Copy, BarChart3, CheckCircle, XCircle, Package, Layers } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/admin/ConfirmModal'
import Link from 'next/link'
import Image from 'next/image'

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
  productIds: string[]
  collectionIds: string[]
  _count: { usages: number }
}

interface Product {
  id: string
  name: string
  color: string | null
  mainImage: string
  collection: { name: string } | null
}

interface Collection {
  id: string
  name: string
  imageUrl: string | null
}

// ─── Product Picker Component ────────────────────────────────────────────────
function ProductPicker({
  products,
  selectedIds,
  onChange,
}: {
  products: Product[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.color || ''} ${p.collection?.name || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  )

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id))

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 bg-accent-gold/10 border border-accent-gold/30 text-neutral-800 rounded-full text-xs font-medium"
            >
              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                <Image
                  src={p.mainImage}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized={p.mainImage.startsWith('/uploads/')}
                />
              </div>
              <span className="max-w-[120px] truncate">{p.name}{p.color && p.color !== 'Main' ? ` · ${p.color}` : ''}</span>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="hover:text-red-500 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-56 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500 text-center">Aucun article trouvé</p>
        ) : (
          filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id)
            return (
              <label
                key={product.id}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-accent-gold/5' : 'hover:bg-neutral-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(product.id)}
                  className="w-4 h-4 accent-accent-gold flex-shrink-0"
                />
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={product.mainImage.startsWith('/uploads/')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {[product.collection?.name, product.color && product.color !== 'Main' ? product.color : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle className="w-4 h-4 text-accent-gold flex-shrink-0" />
                )}
              </label>
            )
          })
        )}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-neutral-500">
          {selectedIds.length} article{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ─── Collection Picker (multi-select) ───────────────────────────────────────
function CollectionPicker({
  collections,
  selectedIds,
  onChange,
}: {
  collections: Collection[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collections.filter((c) => selectedIds.includes(c.id)).map((col) => (
            <span
              key={col.id}
              className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-full text-xs font-medium"
            >
              {col.imageUrl ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-neutral-100">
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    className="object-cover"
                    unoptimized={col.imageUrl.startsWith('/uploads/')}
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-3 h-3 text-purple-400" />
                </div>
              )}
              <span className="max-w-[100px] truncate">{col.name}</span>
              <button type="button" onClick={() => toggle(col.id)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Grid of collections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {collections.map((col) => {
          const isSelected = selectedIds.includes(col.id)
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => toggle(col.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-accent-gold bg-accent-gold/5'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
                {col.imageUrl ? (
                  <Image
                    src={col.imageUrl}
                    alt={col.name}
                    fill
                    className="object-cover"
                    unoptimized={col.imageUrl.startsWith('/uploads/')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-5 h-5 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-medium truncate block ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}`}>
                  {col.name}
                </span>
              </div>
              {isSelected && <CheckCircle className="w-4 h-4 text-accent-gold flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-neutral-500">
          {selectedIds.length} collection{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
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
    productIds: [] as string[],
    collectionIds: [] as string[],
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
      productIds: [],
      collectionIds: [],
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
      restrictionType: promoCode.productIds?.length > 0 ? 'product' : promoCode.collectionIds?.length > 0 ? 'collection' : 'all',
      productIds: promoCode.productIds || [],
      collectionIds: promoCode.collectionIds || [],
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

    if (formData.restrictionType === 'product' && formData.productIds.length === 0) {
      toast.error('Erreur', { description: 'Veuillez sélectionner au moins un article' })
      return
    }

    if (formData.restrictionType === 'collection' && formData.collectionIds.length === 0) {
      toast.error('Erreur', { description: 'Veuillez sélectionner au moins une collection' })
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
          productIds: formData.restrictionType === 'product' ? formData.productIds : [],
          collectionIds: formData.restrictionType === 'collection' ? formData.collectionIds : [],
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

            {/* ── Restriction Section ── */}
            <div className="border border-neutral-200 rounded-xl p-5 space-y-4 bg-neutral-50">
              <div>
                <p className="text-sm font-semibold text-neutral-800 mb-3">Restriction d&apos;application</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'all', label: 'Tous les produits', icon: <Ticket className="w-4 h-4" /> },
                    { value: 'product', label: 'Articles spécifiques', icon: <Package className="w-4 h-4" /> },
                    { value: 'collection', label: 'Collection spécifique', icon: <Layers className="w-4 h-4" /> },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        restrictionType: value as 'all' | 'product' | 'collection',
                        productIds: value !== 'product' ? [] : formData.productIds,
                        collectionIds: value !== 'collection' ? [] : formData.collectionIds,
                      })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.restrictionType === value
                          ? 'border-accent-gold bg-accent-gold/10 text-neutral-900'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.restrictionType === 'product' && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wide">
                    Sélectionner les articles concernés
                  </p>
                  <ProductPicker
                    products={products}
                    selectedIds={formData.productIds}
                    onChange={(ids) => setFormData({ ...formData, productIds: ids })}
                  />
                </div>
              )}

              {formData.restrictionType === 'collection' && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-2 uppercase tracking-wide">
                    Sélectionner les collections concernées
                  </p>
                  <CollectionPicker
                    collections={collections}
                    selectedIds={formData.collectionIds}
                    onChange={(ids) => setFormData({ ...formData, collectionIds: ids })}
                  />
                </div>
              )}
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
                      {promoCode.productIds?.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {promoCode.productIds.length} article{promoCode.productIds.length > 1 ? 's' : ''}
                        </p>
                      )}
                      {promoCode.collectionIds?.length > 0 && (
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {promoCode.collectionIds.length} collection{promoCode.collectionIds.length > 1 ? 's' : ''}
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
