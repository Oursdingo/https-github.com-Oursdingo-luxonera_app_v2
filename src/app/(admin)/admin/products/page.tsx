'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import {
  Package,
  Trash2,
  Search,
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Brand {
  id: string
  name: string
  slug: string
}

interface Collection {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stockQuantity: number
  lowStockThreshold: number
  mainImage: string
  galleryImages: string[]
  featured: boolean
  published: boolean
  brand: Brand
  collection: Collection
  createdAt: string
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

  const { data, error, isLoading } = useSWR<{ products: Product[]; count: number }>(
    '/api/products',
    fetcher
  )

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Échec de la suppression')
      }

      toast.success('Produit supprimé', {
        description: `${productName} a été supprimé avec succès.`,
      })

      // Revalidate the products list
      mutate('/api/products')
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de supprimer le produit.',
      })
    }
  }

  const getStockBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rupture
        </span>
      )
    }
    if (quantity < threshold) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Stock faible ({quantity})
        </span>
      )
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        En stock ({quantity})
      </span>
    )
  }

  // Filter products
  const filteredProducts = data?.products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.collection.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && product.published) ||
      (filterStatus === 'draft' && !product.published)

    return matchesSearch && matchesStatus
  }) || []

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-medium">Erreur de chargement des produits</p>
          <button
            onClick={() => mutate('/api/products')}
            className="mt-4 px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Produits
          </h1>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">
            Gérez votre catalogue de montres de luxe ({data?.count || 0} produit{data?.count !== 1 ? 's' : ''})
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Ajouter un produit</span>
          <span className="sm:hidden">Ajouter</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-accent-gold text-black'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'published'
                  ? 'bg-accent-gold text-black'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Publiés
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'draft'
                  ? 'bg-accent-gold text-black'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Brouillons
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-neutral-600">
              {searchTerm
                ? 'Aucun produit ne correspond à votre recherche.'
                : 'Les produits apparaîtront ici une fois ajoutés à la base de données.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Collection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Marque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.mainImage ? (
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {product.name}
                          </p>
                          {product.featured && (
                            <span className="text-xs text-accent-gold font-medium">
                              ⭐ En vedette
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {product.collection.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {product.brand.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {product.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4">
                      {getStockBadge(product.stockQuantity, product.lowStockThreshold)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {product.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.slug}`}
                          className="p-2 text-neutral-600 hover:text-accent-gold hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.mainImage ? (
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 truncate">
                    {product.name}
                  </h3>
                  {product.featured && (
                    <span className="text-xs text-accent-gold font-medium">
                      ⭐ En vedette
                    </span>
                  )}
                  <p className="text-sm text-neutral-600 mt-1">
                    {product.collection.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {product.brand.name}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Prix:</span>
                  <span className="font-medium text-neutral-900">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Stock:</span>
                  {getStockBadge(product.stockQuantity, product.lowStockThreshold)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Statut:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {product.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-2">
                <Link
                  href={`/admin/products/${product.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
      )}

      {/* Products Count */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="text-sm text-neutral-600 text-center">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} affiché
          {filteredProducts.length > 1 ? 's' : ''}
          {data && filteredProducts.length !== data.count && ` sur ${data.count} au total`}
        </div>
      )}
    </div>
  )
}
