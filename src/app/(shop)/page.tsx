import HeroSection from '@/components/sections/HeroSection'
import FeaturedCollection from '@/components/sections/FeaturedCollection'
import HeritageStory from '@/components/sections/HeritageStory'
import CraftsmanshipSection from '@/components/sections/CraftsmanshipSection'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products?featured=true`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error('Failed to fetch featured products')
      return []
    }

    const data = await res.json()
    const products = data.products || []

    // Map API data to expected Watch structure
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
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredWatches = await getFeaturedProducts()

  return (
    <>
      <HeroSection />
      <FeaturedCollection watches={featuredWatches} />
      <HeritageStory />
      <CraftsmanshipSection />
    </>
  )
}
