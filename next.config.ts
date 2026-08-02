import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: 'dist',
  output: 'export',
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    return config
  }
}

export default nextConfig
