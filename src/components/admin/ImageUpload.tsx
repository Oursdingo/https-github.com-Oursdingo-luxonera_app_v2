'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  className?: string
  required?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Image',
  className = '',
  required = false,
}: ImageUploadProps) {
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

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const uploadFile = async (file: File) => {
    setError('')
    setIsUploading(true)
    setProgress(0)

    // Validate file type (some browsers report empty or generic types)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
    const blockedTypes = ['image/heic', 'image/heif']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    const blockedExtensions = ['heic', 'heif']
    if (blockedTypes.includes(file.type) || blockedExtensions.includes(extension)) {
      setError('Format HEIC/HEIF non supporte. Exportez en JPG ou PNG.')
      setIsUploading(false)
      return
    }
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      setError('Type de fichier invalide. Utilisez JPG, PNG, WEBP ou AVIF.')
      setIsUploading(false)
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. Maximum 5MB.')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
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

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
    setError('')
  }

  const handleClick = () => {
    if (!isUploading && !value) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {!value ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
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
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="w-12 h-12 mx-auto text-accent-gold animate-spin" />
              <p className="text-sm text-neutral-600">Upload en cours...</p>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accent-gold h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-neutral-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-700">
                  Glissez-déposez une image ici
                </p>
                <p className="text-xs text-neutral-500">ou cliquez pour sélectionner</p>
              </div>
              <p className="text-xs text-neutral-400">
                JPG, PNG, WEBP ou AVIF (max 5MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <div className="relative w-full h-64 bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              hover:bg-red-700 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  )
}
