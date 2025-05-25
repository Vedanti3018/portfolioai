/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Add any external image domains here
  },
  experimental: {
    // enable if needed
    // appDir: true,
  },
};

module.exports = nextConfig;
