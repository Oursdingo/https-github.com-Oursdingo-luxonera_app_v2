'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch brands and collections
  const { data: brandsData } = useSWR('/api/brands', fetcher)
  const { data: collectionsData } = useSWR('/api/collections', fetcher)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    brandId: '',
    collectionId: '',
    color: '',
    sku: '',
    stockQuantity: '',
    lowStockThreshold: '5',
    trackInventory: true,
    allowBackorder: false,
    featured: false,
    published: true,
    mainImage: '',
    galleryImages: [],
    specifications: {
      movement: '',
      case: '',
      diameter: '',
      waterResistance: '',
      strap: '',
      features: ['']
    }
  })

  const brands = brandsData?.brands || []
  const collections = collectionsData?.collections || []

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }))
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: [...prev.specifications.features, '']
      }
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: prev.specifications.features.filter((_, i) => i !== index)
      }
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: prev.specifications.features.map((f, i) => i === index ? value : f)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.description || !formData.price || !formData.brandId || !formData.collectionId) {
      toast.error('Erreur', {
        description: 'Veuillez remplir tous les champs obligatoires'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseInt(formData.compareAtPrice) : undefined,
        brandId: formData.brandId,
        collectionId: formData.collectionId,
        color: formData.color || undefined,
        sku: formData.sku || undefined,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        trackInventory: formData.trackInventory,
        allowBackorder: formData.allowBackorder,
        featured: formData.featured,
        published: formData.published,
        mainImage: formData.mainImage || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
        galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
        specifications: {
          movement: formData.specifications.movement || undefined,
          case: formData.specifications.case || undefined,
          diameter: formData.specifications.diameter || undefined,
          waterResistance: formData.specifications.waterResistance || undefined,
          strap: formData.specifications.strap || undefined,
          features: formData.specifications.features.filter(f => f.trim() !== '')
        }
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      const { product } = await response.json()

      toast.success('Produit créé', {
        description: `${product.name} a été créé avec succès`
      })

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error('Erreur', {
        description: error.message || 'Impossible de créer le produit'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Nouveau Produit
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Ajoutez un nouveau produit à votre catalogue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Informations de base
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nom du produit <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Rolex Submariner Date 41mm"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Description détaillée du produit..."
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
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="5000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Prix comparatif (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.compareAtPrice}
                  onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="6000000"
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
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                >
                  <option value="">Sélectionner une marque</option>
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
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                >
                  <option value="">Sélectionner une collection</option>
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
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Noir, Bleu, Or..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  SKU (référence)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="ROL-SUB-001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Gestion du stock
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quantité en stock
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="10"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Seuil de stock faible
                </label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
                  className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
                />
                <span className="text-sm text-neutral-700">Suivre l'inventaire</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowBackorder}
                  onChange={(e) => handleInputChange('allowBackorder', e.target.checked)}
                  className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
                />
                <span className="text-sm text-neutral-700">Autoriser les précommandes</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Images
          </h2>

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
              label="Galerie d'images (optionnel)"
              maxImages={8}
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Spécifications techniques
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mouvement
                </label>
                <input
                  type="text"
                  value={formData.specifications.movement}
                  onChange={(e) => handleSpecChange('movement', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Automatique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Boîtier
                </label>
                <input
                  type="text"
                  value={formData.specifications.case}
                  onChange={(e) => handleSpecChange('case', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Acier inoxydable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Diamètre
                </label>
                <input
                  type="text"
                  value={formData.specifications.diameter}
                  onChange={(e) => handleSpecChange('diameter', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="41mm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Étanchéité
                </label>
                <input
                  type="text"
                  value={formData.specifications.waterResistance}
                  onChange={(e) => handleSpecChange('waterResistance', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="300m"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bracelet
              </label>
              <input
                type="text"
                value={formData.specifications.strap}
                onChange={(e) => handleSpecChange('strap', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Oyster en acier"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Caractéristiques
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm text-accent-gold hover:text-accent-gold/80 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              {formData.specifications.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                    placeholder="Date cyclope, Lunette unidirectionnelle..."
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Statut
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
              />
              <span className="text-sm text-neutral-700">Produit en vedette</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => handleInputChange('published', e.target.checked)}
                className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
              />
              <span className="text-sm text-neutral-700">Publier le produit</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Link
            href="/admin/products"
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
                Création...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Créer le produit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
