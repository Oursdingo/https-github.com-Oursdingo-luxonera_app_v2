import { Suspense } from 'react'
import CatalogContent from '@/components/catalog/CatalogContent'

export default function CatalogPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container-luxury">
        <Suspense fallback={
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">Chargement...</p>
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </div>
    </div>
  )
}
