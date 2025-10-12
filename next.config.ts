import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // React optimization
  reactStrictMode: true,
  // Optimize power preference
  poweredByHeader: false,
  experimental: {
    // Enable server-side chunking
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  allowedDevOrigins: ["*.cloudworkstations.dev"],
  webpack: (config, { isServer }) => {
    // Fix for Handlebars require.extensions issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Handle Handlebars module resolution
    if (!isServer) {
      // For client-side builds, we can ignore Handlebars entirely since it's used by Genkit
      config.resolve.alias = {
        ...config.resolve.alias,
        handlebars: false,
      };
    } else {
      // For server-side builds, provide a mock for require.extensions
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // Ignore warnings about require.extensions
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
    ];

    return config;
  },
};

export default nextConfig;
