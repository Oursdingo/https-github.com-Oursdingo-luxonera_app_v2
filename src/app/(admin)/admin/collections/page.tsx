'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/admin/ConfirmModal'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Collection {
  id: string
  name: string
  description: string | null
  featured: boolean
  products?: any[]
  _count?: { products: number }
}

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR('/api/collections?includeProducts=true', fetcher)

  const collections = data?.collections || []

  const filteredCollections = collections.filter((collection: any) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openDeleteModal = (collection: Collection) => {
    setCollectionToDelete(collection)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setCollectionToDelete(null)
  }

  const handleDelete = async () => {
    if (!collectionToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Collection supprimee', {
        description: `${collectionToDelete.name} et tous ses produits ont ete supprimes`
      })

      closeDeleteModal()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer la collection'
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
            Collections
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Gérez vos collections et leurs produits en vedette
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle collection
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher une collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection: any) => {
          const featuredProduct = collection.products?.find((p: any) => p.featured)
          const totalProducts = collection._count?.products || collection.products?.length || 0
          const publishedProducts = collection.products?.filter((p: any) => p.published).length || 0

          return (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-neutral-100">
                {featuredProduct?.mainImage ? (
                  <Image
                    src={featuredProduct.mainImage}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-neutral-300" />
                  </div>
                )}
                {collection.featured && (
                  <div className="absolute top-2 right-2 bg-accent-gold text-black px-2 py-1 rounded text-xs font-medium">
                    En vedette
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {collection.name}
                </h3>

                {collection.description && (
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {totalProducts} produit{totalProducts > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {publishedProducts} publié{publishedProducts > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/collections/${collection.id}`}
                    className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => openDeleteModal(collection)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCollections.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {searchQuery ? 'Aucune collection trouvée' : 'Aucune collection'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {searchQuery
              ? 'Essayez avec un autre terme de recherche'
              : 'Commencez par créer votre première collection'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/collections/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle collection
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer la collection"
        message={`Etes-vous sur de vouloir supprimer la collection "${collectionToDelete?.name}" ? Tous les produits associes seront egalement supprimes.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
