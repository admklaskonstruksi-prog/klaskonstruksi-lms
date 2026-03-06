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
};

export default nextConfig;