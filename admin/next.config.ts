import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Allow requests from your local network IP
    allowedDevOrigins: [
      'localhost',
      '192.168.1.5'
    ]
  },
  // Use the default .next directory
  distDir: '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  // Remove basePath as it's not needed for separate applications
  // basePath: '/admin'
};

export default nextConfig;
