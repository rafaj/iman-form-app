import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth profile images
      'avatars.githubusercontent.com', // GitHub profile images  
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Completely exclude Prisma from client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@prisma/client': false,
        'prisma': false,
        'fs': false,
        'path': false,
        'crypto': false,
      };
      
      // Add externals to prevent bundling
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        'prisma': 'commonjs prisma'
      });
      
      // More aggressive exclusion
      config.externals.push('node_modules/.prisma/client');
      config.externals.push('@prisma/client/runtime/library');
      config.externals.push('@prisma/client/runtime/data-proxy');
    }
    return config;
  },
};

export default nextConfig;
