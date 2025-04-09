/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Set to false to prevent double mounting in development
  swcMinify: true,
  // Disable TypeScript type checking in build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['i.imgur.com', 'placehold.co'],
  },
  // Configure WebSocket support
  webpack: (config, { isServer }) => {
    // Add WebSocket support in client side
    if (!isServer) {
      config.externals = [...(config.externals || []), { ws: 'ws' }];
    }
    return config;
  },
  // Update server configuration to allow for WebSocket upgrades
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
};

module.exports = nextConfig; 