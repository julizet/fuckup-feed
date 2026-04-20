/**
 * Gets the site URL for redirects.
 * In production, uses NEXT_PUBLIC_SITE_URL or VERCEL_URL.
 * Falls back to window.location.origin for development.
 */
export function getSiteUrl(): string {
  // Check for explicitly set site URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Check for Vercel URL (automatically set on Vercel deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  // Fallback to window.location.origin (client-side only)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side fallback
  return 'http://localhost:3000'
}
