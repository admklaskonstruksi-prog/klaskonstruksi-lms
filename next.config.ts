import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wajib untuk Cloudflare Pages
  output: 'standalone',
  
  // Pengaturan Domain Gambar
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Cloudflare tidak support next/image optimization, pakai unoptimized
    unoptimized: true,
  },
  
  experimental: {
    optimizePackageImports: ["lucide-react", "@lottiefiles/react-lottie-player"],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;