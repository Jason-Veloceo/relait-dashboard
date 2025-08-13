/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force everything to be server-side rendered
  output: 'standalone',
  
  // Disable all static optimizations
  experimental: {
    // Force all pages to be dynamic
    staticWorkerRequestDeduping: false,
  },
  
  // Override static generation completely  
  generateStaticParams: () => [],
  
  // Ensure no pages are pre-rendered
  async generateBuildId() {
    return 'dynamic-build'
  }
};

export default nextConfig;