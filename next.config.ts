import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

let supabaseHost = ''
try {
  supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host
} catch {
  /* sin URL válida: se omite en la CSP */
}

// OWASP A05: Content-Security-Policy estricta
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
  `frame-src https://challenges.cloudflare.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org${supabaseHost ? ` https://${supabaseHost}` : ''}`,
  `font-src 'self' data:`,
  `connect-src 'self' https://challenges.cloudflare.com${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ''}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '6mb' },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
