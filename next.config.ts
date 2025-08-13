import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: 'dist',
  experimental: {
    nextScriptWorkers: true
  },
  output: 'export'
}

export default nextConfig
