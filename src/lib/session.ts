/**
 * Session management for anonymous users
 * Uses localStorage to persist a unique session ID
 */

const SESSION_KEY = 'luxonera_session_id'

/**
 * Get or create a session ID for the current user
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string (will be handled by client)
    return ''
  }

  // Check if we already have a session ID
  let sessionId = localStorage.getItem(SESSION_KEY)

  if (!sessionId) {
    // Generate a new session ID
    sessionId = generateSessionId()
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  // Format: luxs_<timestamp>_<random>
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `luxs_${timestamp}_${random}`
}

/**
 * Clear the current session ID (useful for logout or cart clear)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Check if we have a valid session ID
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(SESSION_KEY)
}
