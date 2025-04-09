/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your other config
  experimental: {
    // Allow requests from your local network IP
    allowedDevOrigins: [
      'localhost',
      '192.168.1.5'
    ]
  }
};

module.exports = nextConfig;