import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    appDir: true
  },
  // Configure for localhost development
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Disable server-side rendering features
  distDir: 'out'
};

export default nextConfig;
