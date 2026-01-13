'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Save, Plus, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NewCollectionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Fetch brands
  const { data: brandsData } = useSWR('/api/brands', fetcher)
  const brands = brandsData?.brands || []

  // Collection data
  const [collectionData, setCollectionData] = useState({
    name: '',
    description: '',
    featured: false,
  })

  // Featured product (image de la collection)
  const [featuredProduct, setFeaturedProduct] = useState({
    name: '',
    description: 'Image représentative de la collection',
    brandId: '',
    mainImage: '',
    galleryImages: [] as string[],
  })

  // Watches (produits normaux)
  const [watches, setWatches] = useState([
    {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      price: '',
      brandId: '',
      color: '',
      mainImage: '',
      galleryImages: [] as string[],
    }
  ])

  const addWatch = () => {
    setWatches([
      ...watches,
      {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        price: '',
        brandId: '',
        color: '',
        mainImage: '',
        galleryImages: [] as string[],
      }
    ])
  }

  const removeWatch = (id: string) => {
    if (watches.length <= 1) {
      toast.error('Erreur', {
        description: 'Vous devez avoir au moins une montre dans la collection'
      })
      return
    }
    setWatches(watches.filter(w => w.id !== id))
  }

  const updateWatch = (id: string, field: string, value: any) => {
    setWatches(watches.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ))
  }

  const updateWatchGallery = (id: string, urls: string[]) => {
    setWatches(watches.map(w =>
      w.id === id ? { ...w, galleryImages: urls } : w
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!collectionData.name) {
      toast.error('Erreur', { description: 'Le nom de la collection est obligatoire' })
      return
    }

    if (!featuredProduct.name || !featuredProduct.brandId || !featuredProduct.mainImage) {
      toast.error('Erreur', { description: 'Veuillez compléter l\'image de la collection' })
      return
    }

    const incompleteWatch = watches.find(w => !w.name || !w.description || !w.price || !w.brandId || !w.mainImage)
    if (incompleteWatch) {
      toast.error('Erreur', { description: 'Veuillez compléter toutes les montres' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: collectionData,
          featuredProduct: {
            ...featuredProduct,
            featured: true,
            published: collectionData.featured,
          },
          watches: watches.map(w => ({
            ...w,
            price: parseInt(w.price),
            featured: false,
            published: true,
          }))
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      const { collection } = await response.json()

      toast.success('Collection créée', {
        description: `${collection.name} a été créée avec succès`
      })

      router.push('/admin/collections')
    } catch (error: any) {
      console.error('Error creating collection:', error)
      toast.error('Erreur', {
        description: error.message || 'Impossible de créer la collection'
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
          href="/admin/collections"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Nouvelle Collection
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Créez une collection avec son image et ses montres
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-accent-gold' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 1 ? 'bg-accent-gold text-black' : 'bg-neutral-200'}`}>1</div>
            <span className="font-medium hidden sm:inline">Collection</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
          <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-accent-gold' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 2 ? 'bg-accent-gold text-black' : 'bg-neutral-200'}`}>2</div>
            <span className="font-medium hidden sm:inline">Image</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
          <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-accent-gold' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 3 ? 'bg-accent-gold text-black' : 'bg-neutral-200'}`}>3</div>
            <span className="font-medium hidden sm:inline">Montres</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Collection Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
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
                  value={collectionData.name}
                  onChange={(e) => setCollectionData({ ...collectionData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Montres de Luxe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={collectionData.description}
                  onChange={(e) => setCollectionData({ ...collectionData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Description de la collection..."
                  rows={4}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={collectionData.featured}
                  onChange={(e) => setCollectionData({ ...collectionData, featured: e.target.checked })}
                  className="w-4 h-4 text-accent-gold focus:ring-accent-gold rounded"
                />
                <span className="text-sm text-neutral-700">Collection en vedette</span>
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!collectionData.name}
                className="px-6 py-3 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Featured Product (Image de la collection) */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Image de la collection
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              Cette image représente votre collection sur le site
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom du produit vedette <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={featuredProduct.name}
                  onChange={(e) => setFeaturedProduct({ ...featuredProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder={`Collection ${collectionData.name}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Marque <span className="text-red-600">*</span>
                </label>
                <select
                  value={featuredProduct.brandId}
                  onChange={(e) => setFeaturedProduct({ ...featuredProduct, brandId: e.target.value })}
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

              <ImageUpload
                value={featuredProduct.mainImage}
                onChange={(url) => setFeaturedProduct({ ...featuredProduct, mainImage: url })}
                label="Image principale"
                required
              />

              <ImageGalleryUpload
                value={featuredProduct.galleryImages}
                onChange={(urls) => setFeaturedProduct({ ...featuredProduct, galleryImages: urls })}
                label="Galerie d'images"
                maxImages={8}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!featuredProduct.name || !featuredProduct.brandId || !featuredProduct.mainImage}
                className="px-6 py-3 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Watches */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Montres de la collection
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Au minimum 1 montre requise
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addWatch}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une montre
                </button>
              </div>
            </div>

            {watches.map((watch, index) => (
              <div key={watch.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Montre #{index + 1}
                  </h3>
                  {watches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWatch(watch.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nom <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={watch.name}
                      onChange={(e) => updateWatch(watch.id, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      placeholder="Rolex Submariner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={watch.description}
                      onChange={(e) => updateWatch(watch.id, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Prix (FCFA) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={watch.price}
                        onChange={(e) => updateWatch(watch.id, 'price', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                        placeholder="5000000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Marque <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={watch.brandId}
                        onChange={(e) => updateWatch(watch.id, 'brandId', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                        required
                      >
                        <option value="">Sélectionner</option>
                        {brands.map((brand: any) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Couleur
                      </label>
                      <input
                        type="text"
                        value={watch.color}
                        onChange={(e) => updateWatch(watch.id, 'color', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                        placeholder="Noir, Or..."
                      />
                    </div>
                  </div>

                  <ImageUpload
                    value={watch.mainImage}
                    onChange={(url) => updateWatch(watch.id, 'mainImage', url)}
                    label="Image principale"
                    required
                  />

                  <ImageGalleryUpload
                    value={watch.galleryImages}
                    onChange={(urls) => updateWatchGallery(watch.id, urls)}
                    label="Galerie d'images"
                    maxImages={8}
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Précédent
              </button>
              <div className="flex gap-4">
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
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Créer la collection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
