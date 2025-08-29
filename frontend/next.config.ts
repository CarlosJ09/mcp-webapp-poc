import type { NextConfig } from "next";

// Check if we're building for static export
const isStaticExport = process.env.BUILD_STATIC === 'true';

const nextConfig: NextConfig = {
  // Only enable static export when explicitly requested
  ...(isStaticExport && { 
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
  }),
  // Standard Next.js configuration for non-static builds
  ...(!isStaticExport && {
    images: {
      unoptimized: false,
    },
    // Configure headers for security (only in non-static mode)
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
  }),
  // Common configuration for both modes
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
