'use client'

import { useState } from 'react'
import { openWhatsAppCheckout } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { toast } from 'sonner'
import Image from 'next/image'

interface BuyNowModalProps {
  watch: {
    id: string
    name: string
    price: number
    mainImage: string
    collection?: { name: string }
    color?: string
    stockQuantity: number
  }
  isOpen: boolean
  onClose: () => void
}

export default function BuyNowModal({ watch, isOpen, onClose }: BuyNowModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameError, setNameError] = useState('')

  // Personnalisation
  const [showCustomization, setShowCustomization] = useState(false)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [deliverToOther, setDeliverToOther] = useState(false)
  const [recipientFirstName, setRecipientFirstName] = useState('')
  const [recipientLastName, setRecipientLastName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState<string>()
  const [recipientFirstNameError, setRecipientFirstNameError] = useState('')
  const [recipientLastNameError, setRecipientLastNameError] = useState('')

  const placeholderImage =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%23f5f5f5" width="800" height="800"/%3E%3Ctext fill="%23999" font-family="serif" font-size="48" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ELuxonera%3C/text%3E%3C/svg%3E'
  const shouldBypassOptimization = (url: string) =>
    url.startsWith('/uploads/') || url.startsWith('data:')
  const summaryImage = watch.mainImage || placeholderImage

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
    return nameRegex.test(name)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomerName(value)

    if (value && !validateName(value)) {
      setNameError('Le nom ne doit contenir que des lettres')
    } else {
      setNameError('')
    }
  }

  const handleRecipientFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRecipientFirstName(value)

    if (value && !validateName(value)) {
      setRecipientFirstNameError('Le prénom ne doit contenir que des lettres')
    } else {
      setRecipientFirstNameError('')
    }
  }

  const handleRecipientLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRecipientLastName(value)

    if (value && !validateName(value)) {
      setRecipientLastNameError('Le nom ne doit contenir que des lettres')
    } else {
      setRecipientLastNameError('')
    }
  }

  const resetForm = () => {
    setCustomerName('')
    setCustomerPhone(undefined)
    setDeliveryMessage('')
    setDeliverToOther(false)
    setRecipientFirstName('')
    setRecipientLastName('')
    setRecipientPhone(undefined)
    setNameError('')
    setRecipientFirstNameError('')
    setRecipientLastNameError('')
    setShowCustomization(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone) {
      toast.error('Erreur', {
        description: 'Veuillez remplir tous les champs',
      })
      return
    }

    if (!validateName(customerName)) {
      toast.error('Erreur', {
        description: 'Le nom ne doit contenir que des lettres',
      })
      return
    }

    // Validation pour la livraison à une autre personne
    if (deliverToOther) {
      if (!recipientFirstName.trim() || !recipientLastName.trim() || !recipientPhone) {
        toast.error('Erreur', {
          description: 'Veuillez remplir tous les champs du destinataire',
        })
        return
      }

      if (!validateName(recipientFirstName) || !validateName(recipientLastName)) {
        toast.error('Erreur', {
          description: 'Le nom et prénom du destinataire ne doivent contenir que des lettres',
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Create order in database
      const orderData = {
        items: [
          {
            productId: watch.id,
            quantity: 1,
          },
        ],
        customerName,
        customerPhone,
        deliveryMessage: deliveryMessage.trim() || undefined,
        recipientFirstName: deliverToOther ? recipientFirstName : undefined,
        recipientLastName: deliverToOther ? recipientLastName : undefined,
        recipientPhone: deliverToOther ? recipientPhone : undefined,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la commande')
      }

      const { order } = await response.json()

      // Prepare WhatsApp message with order number
      const cart = {
        items: [
          {
            name: watch.name,
            quantity: 1,
            price: watch.price,
            color: watch.color,
            collection: watch.collection?.name,
          },
        ],
        total: watch.price,
        customerName,
        customerPhone,
        orderNumber: order.orderNumber,
        deliveryMessage: deliveryMessage.trim() || undefined,
        recipient:
          deliverToOther && recipientPhone
            ? {
                firstName: recipientFirstName,
                lastName: recipientLastName,
                phone: recipientPhone,
              }
            : undefined,
      }

      openWhatsAppCheckout(cart)

      // Show success and close modal
      toast.success('Commande créée', {
        description: `Numéro de commande : ${order.orderNumber}`,
      })

      setTimeout(() => {
        setIsSubmitting(false)
        handleClose()
      }, 500)
    } catch (error: any) {
      console.error('Order creation error:', error)
      setIsSubmitting(false)
      toast.error('Erreur', {
        description: error.message || 'Impossible de créer la commande. Veuillez réessayer.',
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 sm:p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl sm:text-2xl font-display">Acheter maintenant</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Product Summary */}
          <div className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
              <Image
                src={summaryImage}
                alt={watch.name}
                fill
                className="object-contain p-1"
                unoptimized={shouldBypassOptimization(summaryImage)}
              />
            </div>
            <div className="flex-1 min-w-0">
              {watch.collection?.name && (
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  {watch.collection.name}
                </p>
              )}
              <h3 className="font-medium text-neutral-900 truncate">{watch.name}</h3>
              {watch.color && watch.color !== 'Main' && (
                <p className="text-sm text-neutral-600">Couleur: {watch.color}</p>
              )}
              <p className="text-lg font-semibold mt-1">{formatPrice(watch.price)}</p>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="buyNowName" className="block text-sm font-medium mb-2">
                Votre nom complet
              </label>
              <input
                id="buyNowName"
                type="text"
                placeholder="Sharif Sawadogo"
                value={customerName}
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                  nameError
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-neutral-300 focus:border-black'
                }`}
                required
              />
              {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
            </div>

            <div>
              <label htmlFor="buyNowPhone" className="block text-sm font-medium mb-2">
                Votre numéro de téléphone
              </label>
              <PhoneInput
                international
                defaultCountry="BF"
                value={customerPhone}
                onChange={setCustomerPhone}
                className="phone-input-custom"
                placeholder="Entrez votre numéro"
              />
            </div>
          </div>

          {/* Customization Toggle */}
          <div className="border-t border-neutral-200 pt-4">
            <button
              type="button"
              onClick={() => setShowCustomization(!showCustomization)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-neutral-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span className="font-medium">Personnalisation</span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${showCustomization ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Customization Section */}
            {showCustomization && (
              <div className="mt-4 space-y-4 p-4 bg-white border border-neutral-200 rounded-lg">
                {/* Delivery Message */}
                <div>
                  <label htmlFor="buyNowDeliveryMessage" className="block text-sm font-medium mb-2">
                    Message pour la livraison (optionnel)
                  </label>
                  <textarea
                    id="buyNowDeliveryMessage"
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="Ajoutez un message spécial pour votre livraison..."
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-neutral-500">{deliveryMessage.length}/200 caractères</p>
                </div>

                {/* Deliver to Another Person Toggle */}
                <div className="border-t border-neutral-200 pt-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-neutral-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium text-sm">Livrer à une autre personne</span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={deliverToOther}
                        onChange={(e) => setDeliverToOther(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`block w-12 h-6 rounded-full transition-colors ${
                          deliverToOther ? 'bg-black' : 'bg-neutral-300'
                        }`}
                      />
                      <div
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          deliverToOther ? 'translate-x-6' : ''
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Recipient Details */}
                {deliverToOther && (
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <h4 className="font-medium text-sm text-neutral-700">Informations du destinataire</h4>

                    <div>
                      <label htmlFor="buyNowRecipientFirstName" className="block text-sm font-medium mb-2">
                        Prénom du destinataire
                      </label>
                      <input
                        id="buyNowRecipientFirstName"
                        type="text"
                        placeholder="Lionel"
                        value={recipientFirstName}
                        onChange={handleRecipientFirstNameChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                          recipientFirstNameError
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-neutral-300 focus:border-black'
                        }`}
                        required
                      />
                      {recipientFirstNameError && (
                        <p className="mt-1 text-sm text-red-600">{recipientFirstNameError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="buyNowRecipientLastName" className="block text-sm font-medium mb-2">
                        Nom du destinataire
                      </label>
                      <input
                        id="buyNowRecipientLastName"
                        type="text"
                        placeholder="Bouda"
                        value={recipientLastName}
                        onChange={handleRecipientLastNameChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                          recipientLastNameError
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-neutral-300 focus:border-black'
                        }`}
                        required
                      />
                      {recipientLastNameError && (
                        <p className="mt-1 text-sm text-red-600">{recipientLastNameError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="buyNowRecipientPhone" className="block text-sm font-medium mb-2">
                        Numéro de téléphone du destinataire
                      </label>
                      <PhoneInput
                        international
                        defaultCountry="BF"
                        value={recipientPhone}
                        onChange={setRecipientPhone}
                        className="phone-input-custom"
                        placeholder="Entrez le numéro du destinataire"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Sous-total (1 article)</span>
              <span className="font-medium">{formatPrice(watch.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Livraison</span>
              <span className="font-medium">À confirmer</span>
            </div>
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(watch.price)}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <Button
            onClick={handleCheckout}
            disabled={isSubmitting || !customerName.trim() || !customerPhone || !!nameError}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-4 px-8 rounded-lg font-medium flex items-center justify-center gap-3 transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>{isSubmitting ? 'Ouverture...' : 'Commander sur WhatsApp'}</span>
          </Button>

          <p className="text-sm text-neutral-600 text-center">
            Vous serez redirigé vers WhatsApp pour finaliser votre commande
          </p>
        </div>
      </div>
    </div>
  )
}
