import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    nextScriptWorkers: true
  },
  // output: 'standalone'
}

export default nextConfig
