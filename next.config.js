/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/customer-label',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
