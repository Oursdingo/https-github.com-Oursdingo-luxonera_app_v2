'use client'

import { useState, useEffect } from 'react'
import { BellRing, BellOff, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = async () => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false)
      setIsLoading(false)
      return
    }

    setIsSupported(true)

    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      setRegistration(reg)

      // Check existing subscription
      const subscription = await reg.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push support:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = async () => {
    if (!registration) return

    setIsLoading(true)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        toast.error('Permission refusee', {
          description: 'Veuillez autoriser les notifications dans les parametres de votre navigateur',
        })
        setIsLoading(false)
        return
      }

      // Get VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      // Convert VAPID key to Uint8Array
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      toast.success('Notifications activees', {
        description: 'Vous recevrez une notification a chaque nouvelle commande',
      })
    } catch (error: any) {
      console.error('Error subscribing to push:', error)
      toast.error('Erreur', {
        description: error.message || 'Impossible d\'activer les notifications',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!registration) return

    setIsLoading(true)

    try {
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe locally
        await subscription.unsubscribe()

        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      }

      setIsSubscribed(false)
      toast.info('Notifications desactivees')
    } catch (error: any) {
      console.error('Error unsubscribing:', error)
      toast.error('Erreur', {
        description: 'Impossible de desactiver les notifications',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null // Don't show anything if not supported
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`relative p-2 rounded-lg transition-colors ${
        isSubscribed
          ? 'bg-green-50 hover:bg-green-100'
          : 'hover:bg-neutral-100'
      }`}
      title={isSubscribed ? 'Notifications activees - Cliquez pour desactiver' : 'Activer les notifications push'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
      ) : isSubscribed ? (
        <>
          <BellRing className="w-5 h-5 text-green-600" />
          <CheckCircle className="absolute -top-1 -right-1 w-3.5 h-3.5 text-green-500 bg-white rounded-full" />
        </>
      ) : (
        <BellOff className="w-5 h-5 text-neutral-400" />
      )}
    </button>
  )
}
