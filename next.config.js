/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint checking during builds
  eslint: {
    // Disable running ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Disable type checking during builds
  typescript: {
    // Disable running TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 