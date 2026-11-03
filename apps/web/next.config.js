/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bumi-upi/ui', '@bumi-upi/db'],

  images: {
    domains: ['images.unsplash.com', 'api.telegram.org'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_TIMEZONE: 'Asia/Jakarta',
  },
};

module.exports = nextConfig;
