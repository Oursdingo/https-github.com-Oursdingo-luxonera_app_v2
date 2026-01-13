'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Plus } from 'lucide-react'

interface ImageGalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
  className?: string
}

export default function ImageGalleryUpload({
  value = [],
  onChange,
  label = 'Galerie d\'images',
  maxImages = 10,
  className = '',
}: ImageGalleryUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const uploadFiles = async (files: File[]) => {
    // Check if we can add more images
    const remainingSlots = maxImages - value.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images autorisées`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)

    setError('')
    setIsUploading(true)
    setProgress(0)

    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
        if (!validTypes.includes(file.type)) {
          setError(`${file.name}: Type de fichier invalide`)
          continue
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          setError(`${file.name}: Fichier trop volumineux (max 5MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)

        // Update progress
        setProgress(Math.round(((i + 1) / filesToUpload.length) * 100))
      }

      // Add new URLs to existing ones
      onChange([...value, ...uploadedUrls])
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
      setProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  const handleClick = () => {
    if (!isUploading && value.length < maxImages) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = value.length < maxImages

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} ({value.length}/{maxImages})
        </label>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing images */}
        {value.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <div className="relative w-full h-full bg-neutral-100 rounded-lg overflow-hidden">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                hover:bg-red-700 shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Upload zone */}
        {canAddMore && (
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg aspect-square
              flex items-center justify-center cursor-pointer
              transition-all duration-200
              ${
                isDragging
                  ? 'border-accent-gold bg-accent-gold/10 scale-105'
                  : 'border-neutral-300 hover:border-accent-gold hover:bg-neutral-50'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
              multiple
            />

            {isUploading ? (
              <div className="text-center p-4">
                <Loader2 className="w-8 h-8 mx-auto text-accent-gold animate-spin mb-2" />
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden mb-1">
                  <div
                    className="bg-accent-gold h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500">{progress}%</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Plus className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-xs text-neutral-600">Ajouter</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <p className="mt-2 text-xs text-neutral-500">
        Glissez-déposez plusieurs images ou cliquez pour sélectionner (JPG, PNG, WEBP, AVIF - max 5MB chacune)
      </p>
    </div>
  )
}
