import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Run as a real Node production server (SSR, API routes, dynamic rendering)
  // instead of a static HTML export, so it can be started with `next start`.
  output: 'standalone',
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    return config
  },
}

export default nextConfig