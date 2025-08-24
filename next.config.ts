import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Prisma for client-side to prevent browser errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@prisma/client': false,
        'prisma': false,
      };
      config.externals.push('node_modules/.prisma/client');
    }
    return config;
  },
};

export default nextConfig;
