import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pengaturan Upload Video (Jangan Dihapus)
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb', // WAJIB ADA (1GB)
    },
  },
  
  // Pengaturan Domain Gambar (Jangan Dihapus)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

};

export default nextConfig;