/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bumi-upi/ui', '@bumi-upi/db'],
};

module.exports = nextConfig;
