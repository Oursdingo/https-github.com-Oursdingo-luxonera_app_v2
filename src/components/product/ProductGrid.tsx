import { Watch } from '@/types/product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  watches: Watch[]
  cardRef?: (el: HTMLDivElement | null, index: number) => void
  mode?: "collection" | "product"
}

export default function ProductGrid({ watches, cardRef, mode = "product" }: ProductGridProps) {
  if (watches.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 text-lg">Aucune montre trouvée</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {watches.map((watch, index) => (
        <div
          key={watch.id}
          className="product-card"
          ref={cardRef ? (el) => cardRef(el, index) : undefined}
        >
          <ProductCard watch={watch} mode={mode} />
        </div>
      ))}
    </div>
  )
}
