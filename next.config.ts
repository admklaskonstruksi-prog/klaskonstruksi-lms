import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pengaturan Domain Gambar (Jangan Dihapus)
  // Berfungsi untuk mengizinkan gambar dari Bunny, Supabase, dll.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimasi bundle untuk Cloudflare Pages (limit 25MB)
  experimental: {
    optimizePackageImports: ["lucide-react", "@lottiefiles/react-lottie-player"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = true;
    }
    return config;
  },
};

export default nextConfig;