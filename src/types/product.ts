export interface Watch {
  id: string
  slug?: string
  name: string
  brand: string
  collection: string
  price: number
  currency: 'FCFA'
  color?: string
  images: {
    main: string
    gallery?: string[]
    lifestyle?: string[]
  }
  description: string
  specifications?: {
    movement?: string
    case?: string
    diameter?: string
    waterResistance?: string
    strap?: string
    features?: string[]
  }
  inStock: boolean
  stockQuantity?: number
  featured: boolean
  model3d?: string
}

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'name'

export interface FilterOptions {
  collections: string[]
  priceRange: {
    min: number
    max: number
  }
  inStock: boolean
}
