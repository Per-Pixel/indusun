/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'localhost',
      '192.168.1.5'
    ]
  },
  images: {
    domains: ['images.unsplash.com']
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

module.exports = nextConfig;
