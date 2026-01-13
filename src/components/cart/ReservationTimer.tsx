'use client'

import { useState, useEffect } from 'react'

interface ReservationTimerProps {
  expiresAt: string // ISO date string
  onExpire?: () => void
}

export default function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const diff = expiry - now

      return Math.max(0, diff)
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      // Call onExpire when timer reaches zero
      if (remaining === 0 && onExpire) {
        onExpire()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  // Format time as MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Determine urgency level
  const getUrgencyLevel = () => {
    const minutes = Math.floor(timeLeft / 1000 / 60)

    if (minutes <= 2) return 'critical' // Last 2 minutes
    if (minutes <= 5) return 'warning' // Last 5 minutes
    return 'normal'
  }

  const urgency = getUrgencyLevel()

  // Different styles based on urgency
  const urgencyStyles = {
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse',
    critical: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
  }

  const iconStyles = {
    normal: 'text-blue-500',
    warning: 'text-orange-500',
    critical: 'text-red-500',
  }

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-xs text-red-700">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Réservation expirée</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-medium transition-all ${urgencyStyles[urgency]}`}>
      <svg className={`w-4 h-4 ${iconStyles[urgency]}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span>
        {urgency === 'critical' && 'URGENT: '}
        {urgency === 'warning' && 'Attention: '}
        Réservé pour {formatTime(timeLeft)}
      </span>
    </div>
  )
}
