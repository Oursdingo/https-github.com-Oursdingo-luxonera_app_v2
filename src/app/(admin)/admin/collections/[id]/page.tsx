'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Save, Package, Star, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    featured: false,
  })

  const { data, error, isLoading } = useSWR(`/api/collections/${resolvedParams.id}`, fetcher)

  const collection = data?.collection

  // Initialize form when collection loads
  useState(() => {
    if (collection && formData.name === '') {
      setFormData({
        name: collection.name,
        description: collection.description || '',
        featured: collection.featured || false,
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/collections/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      toast.success('Collection mise à jour', {
        description: `${formData.name} a été modifiée avec succès`
      })

      mutate(`/api/collections/${resolvedParams.id}`)
      mutate('/api/collections?includeProducts=true')
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de mettre à jour la collection'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Collection non trouvée
        </h3>
        <Link
          href="/admin/collections"
          className="text-accent-gold hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    )
  }

  const featuredProduct = collection.products.find((p: any) => p.featured)
  const watches = collection.products.filter((p: any) => !p.featured)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/collections"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Modifier la collection
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            {collection.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collection Info */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Informations de la collection
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom de la collection <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  rows={4}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
                />
                <span className="text-sm text-neutral-700">Collection en vedette</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
              <Link
                href="/admin/collections"
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors text-center"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Products List */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Produits de la collection ({collection.products.length})
            </h2>

            <div className="space-y-4">
              {/* Featured Product */}
              {featuredProduct && (
                <div className="border border-accent-gold/30 bg-accent-gold/5 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                    <span className="text-xs font-semibold text-accent-gold">IMAGE DE LA COLLECTION</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      {featuredProduct.mainImage && (
                        <Image
                          src={featuredProduct.mainImage}
                          alt={featuredProduct.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{featuredProduct.name}</h3>
                      <p className="text-sm text-neutral-600">{featuredProduct.brand?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {featuredProduct.published ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <Eye className="w-3 h-3" />
                            Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <EyeOff className="w-3 h-3" />
                            Non publié
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${featuredProduct.slug}`}
                      className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              )}

              {/* Regular Watches */}
              <div className="space-y-3">
                {watches.map((watch: any) => (
                  <div key={watch.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {watch.mainImage && (
                          <Image
                            src={watch.mainImage}
                            alt={watch.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">{watch.name}</h3>
                        <p className="text-sm text-neutral-600">{watch.brand?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {watch.published ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <Eye className="w-3 h-3" />
                              Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                              <EyeOff className="w-3 h-3" />
                              Non publié
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/admin/products/${watch.slug}`}
                        className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {watches.length === 0 && (
              <p className="text-neutral-500 text-center py-8">
                Aucune montre dans cette collection
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Statistiques</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-600">Total produits</span>
                <span className="text-lg font-semibold text-neutral-900">{collection.products.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Publiés</span>
                <span className="text-lg font-semibold text-green-900">
                  {collection.products.filter((p: any) => p.published).length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-600">Non publiés</span>
                <span className="text-lg font-semibold text-neutral-900">
                  {collection.products.filter((p: any) => !p.published).length}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 mb-2">
                Créée le {new Date(collection.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-neutral-500">
                Modifiée le {new Date(collection.updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
