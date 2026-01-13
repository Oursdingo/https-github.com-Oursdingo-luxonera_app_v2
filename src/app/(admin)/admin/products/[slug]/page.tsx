'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { ArrowLeft, Save, TrendingUp, TrendingDown, Plus, X, Package2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import StockManager from '@/components/admin/StockManager'
import ImageUpload from '@/components/admin/ImageUpload'
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  // Fetch product, brands, and collections
  const { data: productData, error: productError } = useSWR(
    `/api/products/${resolvedParams.slug}`,
    fetcher
  )
  const { data: brandsData } = useSWR('/api/brands', fetcher)
  const { data: collectionsData } = useSWR('/api/collections', fetcher)

  const product = productData?.product
  const brands = brandsData?.brands || []
  const collections = collectionsData?.collections || []

  // Initialize form when product loads
  useEffect(() => {
    if (product && !formData) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        brandId: product.brandId,
        collectionId: product.collectionId,
        color: product.color || '',
        sku: product.sku || '',
        lowStockThreshold: product.lowStockThreshold.toString(),
        trackInventory: product.trackInventory,
        allowBackorder: product.allowBackorder,
        featured: product.featured,
        published: product.published,
        mainImage: product.mainImage,
        galleryImages: product.galleryImages || [],
        specifications: {
          movement: product.specifications?.movement || '',
          case: product.specifications?.case || '',
          diameter: product.specifications?.diameter || '',
          waterResistance: product.specifications?.waterResistance || '',
          strap: product.specifications?.strap || '',
          features: Array.isArray(product.specifications?.features)
            ? product.specifications.features
            : (product.specifications?.features ? [product.specifications.features] : [''])
        }
      })
    }
  }, [product, formData])

  if (productError) {
    return (
      <div className="text-center py-20">
        <Package2 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Produit non trouvé
        </h3>
        <Link
          href="/admin/products"
          className="text-accent-gold hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    )
  }

  if (!product || !formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSpecChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }))
  }

  const addFeature = () => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: [...(prev.specifications?.features || []), '']
      }
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: (prev.specifications?.features || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: (prev.specifications?.features || []).map((f: string, i: number) => i === index ? value : f)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseInt(formData.compareAtPrice) : null,
        brandId: formData.brandId,
        collectionId: formData.collectionId,
        color: formData.color || null,
        sku: formData.sku || null,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        trackInventory: formData.trackInventory,
        allowBackorder: formData.allowBackorder,
        featured: formData.featured,
        published: formData.published,
        mainImage: formData.mainImage,
        galleryImages: formData.galleryImages.filter((img: string) => img.trim() !== ''),
        specifications: {
          movement: formData.specifications.movement || undefined,
          case: formData.specifications.case || undefined,
          diameter: formData.specifications.diameter || undefined,
          waterResistance: formData.specifications.waterResistance || undefined,
          strap: formData.specifications.strap || undefined,
          features: formData.specifications.features.filter((f: string) => f.trim() !== '')
        }
      }

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      toast.success('Produit mis à jour', {
        description: `${formData.name} a été modifié avec succès`
      })

      mutate(`/api/products/${resolvedParams.slug}`)
      mutate('/api/products')
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de mettre à jour le produit'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
              Modifier le produit
            </h1>
            <p className="text-neutral-600 mt-1 text-sm sm:text-base">
              {product.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Informations de base</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom du produit <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prix (FCFA) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prix comparatif
                    </label>
                    <input
                      type="number"
                      value={formData.compareAtPrice}
                      onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Marque <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => handleInputChange('brandId', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                      required
                    >
                      {brands.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Collection <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.collectionId}
                      onChange={(e) => handleInputChange('collectionId', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                      required
                    >
                      {collections.map((collection: any) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Couleur
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">En vedette</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Publié</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trackInventory}
                      onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Suivre l'inventaire</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images - Compact version */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Images</h2>
              <div className="space-y-6">
                <ImageUpload
                  value={formData.mainImage}
                  onChange={(url) => handleInputChange('mainImage', url)}
                  label="Image principale"
                  required
                />

                <ImageGalleryUpload
                  value={formData.galleryImages}
                  onChange={(urls) => handleInputChange('galleryImages', urls)}
                  label="Galerie d'images"
                  maxImages={8}
                />
              </div>
            </div>

            {/* Specifications - Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Spécifications</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Mouvement"
                    value={formData.specifications.movement}
                    onChange={(e) => handleSpecChange('movement', e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Boîtier"
                    value={formData.specifications.case}
                    onChange={(e) => handleSpecChange('case', e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Diamètre"
                    value={formData.specifications.diameter}
                    onChange={(e) => handleSpecChange('diameter', e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Étanchéité"
                    value={formData.specifications.waterResistance}
                    onChange={(e) => handleSpecChange('waterResistance', e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Bracelet"
                  value={formData.specifications.strap}
                  onChange={(e) => handleSpecChange('strap', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700">Caractéristiques</label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-sm text-accent-gold hover:text-accent-gold/80"
                    >
                      <Plus className="w-4 h-4 inline" />
                    </button>
                  </div>
                  {(formData.specifications?.features || []).map((feature: string, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                href="/admin/products"
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 text-center text-sm"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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
        </div>

        {/* Stock Manager - Sidebar */}
        <div className="lg:col-span-1">
          <StockManager product={product} slug={resolvedParams.slug} />
        </div>
      </div>
    </div>
  )
}
