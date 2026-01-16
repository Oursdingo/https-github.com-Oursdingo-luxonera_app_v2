import { notFound } from 'next/navigation'
import ProductCard from '@/components/product/ProductCard'
import WatchDetails from '@/components/product/WatchDetails'

// Force dynamic rendering to fetch fresh stock data
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Fetch product by slug from API (using the [id] endpoint which supports slug lookup)
async function getProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // Use the [id] endpoint which can search by slug or id
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'no-store', // Disable cache to always fetch fresh data
    })

    if (!res.ok) {
      console.error(`Failed to fetch product with slug: ${slug}, status: ${res.status}`)
      return null
    }

    const data = await res.json()
    const product = data.product

    if (!product) {
      console.error(`Product not found for slug: ${slug}`)
      return null
    }

    // Map API data to expected format
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      collection: product.collection, // Keep the full object for WatchDetails
      collectionId: product.collectionId,
      color: product.color || '',
      featured: product.featured,
      inStock: product.stockQuantity > 0,
      stockQuantity: product.stockQuantity,
      mainImage: product.mainImage, // Flat structure for WatchDetails
      galleryImages: product.galleryImages || [],
      lifestyleImages: product.lifestyleImages || [],
      specifications: product.specifications,
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Get color variants from same collection
async function getColorVariants(collectionId: string, currentProductId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    const variants = data.products
      .filter(
        (p: any) =>
          p.collectionId === collectionId &&
          p.id !== currentProductId &&
          p.color !== 'Main'
      )
      .slice(0, 6)

    // Map API data to ProductCard expected format
    return variants.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      collection: product.collection?.name || '',
      color: product.color || '',
      featured: product.featured,
      inStock: product.stockQuantity > 0,
      images: {
        main: product.mainImage,
        gallery: product.galleryImages || [],
        lifestyle: product.lifestyleImages || [],
      },
      specifications: product.specifications,
    }))
  } catch (error) {
    console.error('Error fetching variants:', error)
    return []
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products`)

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.products.map((product: any) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.slug)

  if (!product) {
    return {
      title: 'Produit non trouvé | Luxonera',
    }
  }

  return {
    title: `${product.name} | Luxonera`,
    description: product.description,
  }
}

export default async function WatchPage({ params }: PageProps) {
  const resolvedParams = await params
  const watch = await getProduct(resolvedParams.slug)

  if (!watch) {
    notFound()
  }

  const colorVariants = await getColorVariants(watch.collectionId, watch.id)

  return (
    <div className="pt-32 pb-20">
      <div className="container-luxury">
        {/* Product Detail */}
        <WatchDetails watch={watch} />

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <div>
            <h2 className="text-3xl font-display mb-8">
              Autres couleurs disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {colorVariants.map((variant: any) => (
                <ProductCard key={variant.id} watch={variant} mode="product" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
