import webpush from 'web-push'
import { prisma } from './prisma'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:contact@luxonera.shop',
    vapidPublicKey,
    vapidPrivateKey
  )
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    [key: string]: any
  }
}

/**
 * Send push notification to all active subscriptions
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('VAPID keys not configured')
    results.errors.push('VAPID keys not configured')
    return results
  }

  try {
    // Get all active subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { active: true },
    })

    if (subscriptions.length === 0) {
      console.log('No active push subscriptions found')
      return results
    }

    console.log(`Sending push notification to ${subscriptions.length} subscriptions`)

    // Send to each subscription
    const sendPromises = subscriptions.map(async (subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        )
        results.success++
        console.log(`Push sent successfully to: ${subscription.endpoint.slice(0, 50)}...`)
      } catch (error: any) {
        results.failed++
        const errorMessage = error.message || 'Unknown error'
        results.errors.push(`${subscription.id}: ${errorMessage}`)
        console.error(`Push failed for ${subscription.id}:`, errorMessage)

        // If subscription is invalid (410 Gone or 404), mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { active: false },
          })
          console.log(`Marked subscription ${subscription.id} as inactive`)
        }
      }
    })

    await Promise.all(sendPromises)
  } catch (error: any) {
    console.error('Error sending push notifications:', error)
    results.errors.push(error.message || 'Unknown error')
  }

  return results
}

/**
 * Send order notification to admins
 */
export async function sendOrderNotification(order: {
  orderNumber: string
  customerName: string
  total: number
  itemCount: number
}): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '🛍️ Nouvelle Commande!',
    body: `${order.customerName} - ${order.total.toLocaleString('fr-FR')} FCFA (${order.itemCount} article${order.itemCount > 1 ? 's' : ''})`,
    icon: '/images/logo/logo.png',
    badge: '/images/logo/logo.png',
    tag: `order-${order.orderNumber}`,
    data: {
      url: '/admin/orders',
      orderNumber: order.orderNumber,
      type: 'new_order',
    },
  }

  const result = await sendPushNotification(payload)
  console.log(`Order notification sent: ${result.success} success, ${result.failed} failed`)
}
