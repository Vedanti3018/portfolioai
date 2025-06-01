/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Add any external image domains here
  },
  experimental: {
    // This will help with the dynamic server usage warning
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Handlebars
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader'
    });

    // Handle bufferutil and utf-8-validate
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false
      };
    }

    return config;
  },
};

module.exports = nextConfig;
