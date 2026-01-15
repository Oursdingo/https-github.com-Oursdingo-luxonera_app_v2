'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductGrid from '@/components/product/ProductGrid'
import { SortOption } from '@/types/product'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const collectionFromUrl = searchParams.get('collection')

  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])

  // Fetch products from API
  const { data: productsData, error: productsError, isLoading: productsLoading } = useSWR('/api/products', fetcher)

  // Fetch collections from API
  const { data: collectionsData, error: collectionsError } = useSWR('/api/collections', fetcher)

  // Map API data to expected Watch structure
  const watches = useMemo(() => {
    const products = productsData?.products || []
    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      collection: product.collection?.name || '',
      color: product.color || '',
      featured: product.featured,
      inStock: product.stockQuantity > 0,
      stockQuantity: product.stockQuantity,
      images: {
        main: product.mainImage,
        gallery: product.galleryImages || [],
        lifestyle: product.lifestyleImages || [],
      },
      specifications: product.specifications,
    }))
  }, [productsData])

  const collections = collectionsData?.collections?.map((c: any) => c.name) || []

  // Pré-sélectionner la collection depuis l'URL (une seule fois au montage)
  useEffect(() => {
    if (collectionFromUrl && collections.includes(collectionFromUrl)) {
      setSelectedCollection(collectionFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gérer le changement de collection avec mise à jour de l'URL
  const handleCollectionChange = (collection: string) => {
    setSelectedCollection(collection)

    // Mettre à jour l'URL
    const params = new URLSearchParams(searchParams.toString())
    if (collection === 'all') {
      params.delete('collection')
    } else {
      params.set('collection', collection)
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const filteredAndSortedWatches = useMemo(() => {
    let filtered = [...watches]

    // Exclure les images "Main" (collections) du catalogue
    filtered = filtered.filter((watch: any) => watch.color !== "Main")

    // Filter by collection
    if (selectedCollection !== 'all') {
      filtered = filtered.filter((watch: any) => watch.collection === selectedCollection)
    }

    // Filter by price range
    filtered = filtered.filter(
      (watch: any) => watch.price >= priceRange[0] && watch.price <= priceRange[1]
    )

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a: any, b: any) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a: any, b: any) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name))
        break
      case 'newest':
        filtered.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return filtered
  }, [watches, selectedCollection, sortBy, priceRange])

  // Loading state
  if (productsLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
        <p className="text-neutral-500 text-lg mt-4">Chargement des produits...</p>
      </div>
    )
  }

  // Error state
  if (productsError || collectionsError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">Erreur lors du chargement des produits.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display mb-4">
          {selectedCollection !== 'all' ? selectedCollection : 'Catalogue Complet'}
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
          {selectedCollection !== 'all'
            ? `Découvrez toutes les variantes de ${selectedCollection}`
            : 'Explorez notre collection complète de montres de luxe'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-12">
        {/* Message informatif si un filtre de collection est appliqué */}
        {selectedCollection !== 'all' && (
          <div className="mb-4 p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg flex items-center justify-between">
            <p className="text-sm text-neutral-700">
              Filtre actif : <span className="font-semibold">{selectedCollection}</span>
            </p>
            <button
              onClick={() => handleCollectionChange('all')}
              className="text-sm text-neutral-600 hover:text-black underline transition-colors"
            >
              Voir toutes les montres
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Collection</label>
            <select
              value={selectedCollection}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="all">Toutes les collections</option>
              {collections.map((collection: string) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
          </div>

          {/* Results count */}
          <div>
            <label className="block text-sm font-medium mb-2 invisible">Résultats</label>
            <p className="text-sm text-neutral-600 px-4 py-2">
              {filteredAndSortedWatches.length} montre{filteredAndSortedWatches.length > 1 ? 's' : ''} trouvée{filteredAndSortedWatches.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid watches={filteredAndSortedWatches} />
    </>
  )
}
