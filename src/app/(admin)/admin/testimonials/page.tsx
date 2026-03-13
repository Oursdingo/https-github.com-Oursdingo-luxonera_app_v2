'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Plus, Search, Trash2, MessageCircle, Save, X, Loader2, Eye, EyeOff, Star } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import ConfirmModal from '@/components/admin/ConfirmModal'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Testimonial {
  id: string
  type: 'CONVERSATION' | 'PHOTO'
  customerName: string
  date: string
  conversationImageUrl: string | null
  imageUrl: string | null
  platform: 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL' | null
  featured: boolean
  published: boolean
}

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'CONVERSATION' as 'CONVERSATION' | 'PHOTO',
    conversationImageUrl: '',
    imageUrl: '',
    platform: 'WHATSAPP' as 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL',
    featured: false,
    published: true,
  })

  const { data, isLoading, mutate } = useSWR('/api/testimonials?all=true', async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

  // Fetch all (including unpublished) for admin
  const { data: adminData } = useSWR('/api/admin/testimonials', async () => {
    const res = await fetch('/api/testimonials')
    return res.json()
  })

  const testimonials: Testimonial[] = data?.testimonials || adminData?.testimonials || []

  const filteredTestimonials = testimonials.filter((t) =>
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      type: 'CONVERSATION',
      conversationImageUrl: '',
      imageUrl: '',
      platform: 'WHATSAPP',
      featured: false,
      published: true,
    })
    setIsCreating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName.trim()) {
      toast.error('Erreur', { description: 'Le nom du client est obligatoire' })
      return
    }

    const imageUrl = formData.type === 'CONVERSATION' ? formData.conversationImageUrl : formData.imageUrl
    if (!imageUrl) {
      toast.error('Erreur', { description: 'L\'image est obligatoire' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          conversationImageUrl: formData.type === 'CONVERSATION' ? formData.conversationImageUrl : undefined,
          imageUrl: formData.type === 'PHOTO' ? formData.imageUrl : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la creation')
      }

      toast.success('Temoignage cree', {
        description: `Le temoignage de ${formData.customerName} a ete ajoute`
      })

      resetForm()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de creer le temoignage'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePublished = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !testimonial.published }),
      })

      if (!response.ok) throw new Error('Erreur')

      toast.success(testimonial.published ? 'Temoignage masque' : 'Temoignage publie')
      mutate()
    } catch {
      toast.error('Erreur lors de la mise a jour')
    }
  }

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !testimonial.featured }),
      })

      if (!response.ok) throw new Error('Erreur')

      toast.success(testimonial.featured ? 'Retire des favoris' : 'Ajoute aux favoris')
      mutate()
    } catch {
      toast.error('Erreur lors de la mise a jour')
    }
  }

  const openDeleteModal = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setTestimonialToDelete(null)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/testimonials/${testimonialToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Temoignage supprime')
      closeDeleteModal()
      mutate()
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer le temoignage'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getPlatformBadge = (platform: string | null) => {
    const config: Record<string, { label: string; color: string }> = {
      WHATSAPP: { label: 'WhatsApp', color: 'bg-green-500' },
      INSTAGRAM: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
      EMAIL: { label: 'Email', color: 'bg-blue-500' },
    }
    return platform ? config[platform] : null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900">
            Temoignages
          </h1>
          <p className="text-neutral-600 mt-1 text-sm sm:text-base">
            Gerez les temoignages clients (screenshots WhatsApp, photos)
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau temoignage
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Total</p>
          <p className="text-2xl font-bold text-neutral-900">{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Publies</p>
          <p className="text-2xl font-bold text-green-600">{testimonials.filter(t => t.published).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Masques</p>
          <p className="text-2xl font-bold text-neutral-400">{testimonials.filter(t => !t.published).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">Favoris</p>
          <p className="text-2xl font-bold text-accent-gold">{testimonials.filter(t => t.featured).length}</p>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Nouveau temoignage
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom du client <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CONVERSATION' | 'PHOTO' })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                >
                  <option value="CONVERSATION">Conversation (Screenshot)</option>
                  <option value="PHOTO">Photo client</option>
                </select>
              </div>
            </div>

            {formData.type === 'CONVERSATION' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Plateforme
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL' })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <ImageUpload
                value={formData.type === 'CONVERSATION' ? formData.conversationImageUrl : formData.imageUrl}
                onChange={(url) => {
                  if (formData.type === 'CONVERSATION') {
                    setFormData({ ...formData, conversationImageUrl: url })
                  } else {
                    setFormData({ ...formData, imageUrl: url })
                  }
                }}
                label={formData.type === 'CONVERSATION' ? 'Screenshot de conversation' : 'Photo du client'}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 accent-accent-gold"
                />
                <span className="text-sm text-neutral-700">Publier immediatement</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-accent-gold"
                />
                <span className="text-sm text-neutral-700">Mettre en avant</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Creer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTestimonials.map((testimonial) => {
          const platformBadge = getPlatformBadge(testimonial.platform)
          const imageUrl = testimonial.conversationImageUrl || testimonial.imageUrl

          return (
            <div
              key={testimonial.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                !testimonial.published ? 'border-neutral-300 opacity-60' : 'border-neutral-200'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] bg-neutral-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`Temoignage de ${testimonial.customerName}`}
                    fill
                    className="object-cover"
                    unoptimized={imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/testimonials/')}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MessageCircle className="w-12 h-12 text-neutral-300" />
                  </div>
                )}

                {/* Platform Badge */}
                {platformBadge && (
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs font-medium ${platformBadge.color}`}>
                    {platformBadge.label}
                  </div>
                )}

                {/* Featured Badge */}
                {testimonial.featured && (
                  <div className="absolute top-2 right-2 bg-accent-gold text-black p-1.5 rounded-full">
                    <Star className="w-4 h-4" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900 truncate">
                    {testimonial.customerName}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {new Date(testimonial.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => togglePublished(testimonial)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      testimonial.published
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {testimonial.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {testimonial.published ? 'Publie' : 'Masque'}
                  </button>
                  <button
                    onClick={() => toggleFeatured(testimonial)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      testimonial.featured
                        ? 'bg-accent-gold/20 text-accent-gold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={testimonial.featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(testimonial)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTestimonials.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
          <MessageCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {searchQuery ? 'Aucun temoignage trouve' : 'Aucun temoignage'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {searchQuery
              ? 'Essayez avec un autre terme de recherche'
              : 'Ajoutez votre premier temoignage client'}
          </p>
          {!searchQuery && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-black font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau temoignage
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer le temoignage"
        message={`Etes-vous sur de vouloir supprimer le temoignage de "${testimonialToDelete?.customerName}" ?`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
