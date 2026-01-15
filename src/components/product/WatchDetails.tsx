'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import Button from '@/components/ui/Button'
import { openWhatsAppChat } from '@/lib/whatsapp'
import BuyNowModal from './BuyNowModal'

interface WatchDetailsProps {
  watch: any
}

export default function WatchDetails({ watch }: WatchDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [showBuyNowModal, setShowBuyNowModal] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const allImages = [watch.mainImage, ...(watch.galleryImages || [])]
  const isInStock = watch.stockQuantity > 0

  const placeholderImage =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%23f5f5f5" width="800" height="800"/%3E%3Ctext fill="%23999" font-family="serif" font-size="48" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ELuxonera%3C/text%3E%3C/svg%3E'

  const handleAddToCart = async () => {
    await addItem({
      id: watch.id,
      slug: watch.slug,
      name: watch.name,
      brand: watch.brand?.name || '',
      price: watch.price,
      currency: 'FCFA',
      images: {
        main: watch.mainImage,
        gallery: watch.galleryImages || [],
      },
      description: watch.description || '',
      collection: watch.collection?.name || '',
      color: watch.color || '',
      inStock: isInStock,
      stockQuantity: watch.stockQuantity,
      featured: watch.featured || false,
    })
  }

  const handleWhatsAppOrder = () => {
    let message = `🛍️ COMMANDE LUXONERA\n\n`
    message += `Je souhaite commander:\n\n`
    message += `📦 Montre: ${watch.name}\n`

    if (watch.collection?.name) {
      message += `   - Collection: ${watch.collection.name}\n`
    }

    if (watch.color && watch.color !== 'Main') {
      message += `   - Couleur: ${watch.color}\n`
    }

    message += `   - Prix: ${formatPrice(watch.price)}\n\n`

    message += `✅ Merci de me confirmer la disponibilité et les modalités de livraison.`

    openWhatsAppChat(message)
  }

  return (
    <div className="grid md:grid-cols-2 gap-12 mb-20">
      {/* Gallery */}
      <div>
        {/* Main Image */}
        <div className="relative w-full h-[600px] mb-4 bg-neutral-50 rounded-lg overflow-hidden">
          <Image
            src={
              !imageError && allImages[selectedImage]
                ? allImages[selectedImage]
                : placeholderImage
            }
            alt={watch.name}
            fill
            className="object-contain p-4"
            priority
            onError={() => setImageError(true)}
          />
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-4">
          {allImages.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(index)
                setImageError(false)
              }}
              className={`relative w-full h-24 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-black'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <Image
                src={img || placeholderImage}
                alt={`${watch.name} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
          {watch.collection?.name}
        </p>
        <h1 className="text-4xl md:text-5xl font-display mb-4">
          {watch.name}
        </h1>

        {/* Stock Badge & Color */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Stock Status Badge */}
          {watch.stockQuantity === 0 ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Rupture de stock
            </span>
          ) : watch.stockQuantity <= 5 ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Presque en rupture - {watch.stockQuantity} {watch.stockQuantity === 1 ? 'restant' : 'restants'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              En stock
            </span>
          )}

          {/* Color Badge */}
          {watch.color && watch.color !== 'Main' && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-800 rounded-full">
              <span className="w-3 h-3 rounded-full bg-neutral-400"></span>
              <span className="font-medium">{watch.color}</span>
            </span>
          )}
        </div>

        <p className="text-3xl font-medium mb-6">
          {formatPrice(watch.price)}
        </p>

        <div className="prose prose-lg mb-8">
          <p className="text-neutral-700 leading-relaxed">
            {watch.description}
          </p>
        </div>

        {/* Additional Stock Info */}
        {isInStock && watch.stockQuantity > 5 && (
          <div className="mb-6">
            <span className="text-sm text-neutral-600">
              {watch.stockQuantity} unités disponibles
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 mb-4">
          {isInStock ? (
            <>
              {/* Primary Action: Buy Now */}
              <Button
                onClick={() => setShowBuyNowModal(true)}
                variant="primary"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Acheter maintenant
              </Button>

              {/* Secondary Action: Add to Cart */}
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Ajouter au panier
              </Button>
            </>
          ) : (
            /* Out of Stock: WhatsApp Order */
            <Button
              onClick={handleWhatsAppOrder}
              variant="secondary"
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-0"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Commander via WhatsApp
            </Button>
          )}
        </div>

        {/* Helper Message */}
        <div className="mb-8">
          {isInStock ? (
            <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              💡 Cliquez sur &quot;Acheter maintenant&quot; pour commander directement,
              ou ajoutez au panier pour continuer vos achats.
            </p>
          ) : (
            <p className="text-sm text-neutral-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              ⚠️ Ce produit est en rupture de stock. Contactez-nous via
              WhatsApp pour connaître la date de réapprovisionnement.
            </p>
          )}
        </div>

        {/* Specifications */}
        {watch.specifications && (
          <div className="border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-display mb-6">Spécifications</h2>
            <dl className="space-y-4">
              {watch.specifications.movement && (
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <dt className="font-medium text-neutral-800">
                    Mouvement
                  </dt>
                  <dd className="text-neutral-600">
                    {watch.specifications.movement}
                  </dd>
                </div>
              )}
              {watch.specifications.case && (
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <dt className="font-medium text-neutral-800">Boîtier</dt>
                  <dd className="text-neutral-600">
                    {watch.specifications.case}
                  </dd>
                </div>
              )}
              {watch.specifications.diameter && (
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <dt className="font-medium text-neutral-800">Diamètre</dt>
                  <dd className="text-neutral-600">
                    {watch.specifications.diameter}
                  </dd>
                </div>
              )}
              {watch.specifications.waterResistance && (
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <dt className="font-medium text-neutral-800">
                    Étanchéité
                  </dt>
                  <dd className="text-neutral-600">
                    {watch.specifications.waterResistance}
                  </dd>
                </div>
              )}
              {watch.specifications.strap && (
                <div className="flex justify-between py-3 border-b border-neutral-100">
                  <dt className="font-medium text-neutral-800">Bracelet</dt>
                  <dd className="text-neutral-600">
                    {watch.specifications.strap}
                  </dd>
                </div>
              )}
            </dl>

            {/* Features */}
            {watch.specifications.features &&
              watch.specifications.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Caractéristiques</h3>
                  <ul className="space-y-2">
                    {watch.specifications.features.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-neutral-600"
                      >
                        <span className="text-accent-gold mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Buy Now Modal */}
      <BuyNowModal
        watch={{
          id: watch.id,
          name: watch.name,
          price: watch.price,
          mainImage: watch.mainImage,
          collection: watch.collection,
          color: watch.color,
          stockQuantity: watch.stockQuantity,
        }}
        isOpen={showBuyNowModal}
        onClose={() => setShowBuyNowModal(false)}
      />
    </div>
  )
}
