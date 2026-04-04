import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.27.245.75'],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Avoid double-rendering in production
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
  },
  experimental: {
    optimizeCss: true, // Minify CSS in production
  },
};

export default nextConfig;
