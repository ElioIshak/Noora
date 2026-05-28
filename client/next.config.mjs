/** @type {import('next').NextConfig} */
const backendBaseUrl = (process.env.NEXT_PUBLIC_API_PROXY_TARGET || 'http://localhost:4000').replace(/\/+$/, '')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
