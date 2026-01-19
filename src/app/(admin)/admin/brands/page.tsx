'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Plus, Search, Edit, Trash2, Tag, Save, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import ConfirmModal from '@/components/admin/ConfirmModal'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  _count: {
    products: number
    collections: number
  }
}

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  })

  const { data, error, isLoading, mutate } = useSWR('/api/brands', fetcher)

  const brands: Brand[] = data?.brands || []

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({ name: '', description: '', logoUrl: '' })
    setIsCreating(false)
    setEditingBrand(null)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
    })
    setIsCreating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Erreur', { description: 'Le nom de la marque est obligatoire' })
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands'
      const method = editingBrand ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(editingBrand ? 'Marque modifiee' : 'Marque creee', {
        description: `${formData.name} a ete ${editingBrand ? 'modifiee' : 'creee'} avec succes`
      })

      resetForm()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de sauvegarder la marque'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (brand: Brand) => {
    setBrandToDelete(brand)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setBrandToDelete(null)
  }

  const handleDelete = async () => {
    if (!brandToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Marque supprimee', {
        description: `${brandToDelete.name} et ses donnees associees ont ete supprimes`
      })

      closeDeleteModal()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer la marque'
      })
    } finally {
      setIsDeleting(false)
    }
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
            Marques
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Gerez vos marques et leurs collections associees
          </p>
        </div>
        {!isCreating && !editingBrand && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle marque
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingBrand) && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              {editingBrand ? `Modifier: ${editingBrand.name}` : 'Nouvelle marque'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom de la marque <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Casio, Rolex, Curren..."
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
                  placeholder="Description de la marque..."
                />
              </div>
            </div>

            <div>
              <ImageUpload
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                label="Logo de la marque"
              />
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
                    {editingBrand ? 'Modifier' : 'Creer'}
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
            placeholder="Rechercher une marque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Logo */}
            <div className="relative h-32 bg-neutral-100 flex items-center justify-center">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  className="object-contain p-4"
                  unoptimized={brand.logoUrl.startsWith('/uploads/')}
                />
              ) : (
                <Tag className="w-12 h-12 text-neutral-300" />
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {brand.name}
              </h3>

              {brand.description && (
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                  {brand.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                <span>{brand._count?.collections || 0} collection(s)</span>
                <span>{brand._count?.products || 0} produit(s)</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => openDeleteModal(brand)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBrands.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
          <Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {searchQuery ? 'Aucune marque trouvee' : 'Aucune marque'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {searchQuery
              ? 'Essayez avec un autre terme de recherche'
              : 'Commencez par creer votre premiere marque'}
          </p>
          {!searchQuery && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle marque
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer la marque"
        message={`Etes-vous sur de vouloir supprimer la marque "${brandToDelete?.name}" ? Toutes les collections et produits associes seront egalement supprimes.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
