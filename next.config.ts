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

  // --- TAMBAHAN BARU: SECURITY HEADERS ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Mencegah web Anda dimasukkan ke iframe web penipu
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Mencegah browser menebak tipe file (mencegah XSS)
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Melindungi data asal pengunjung
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()", // Mematikan akses fitur yang tidak dipakai
          },
        ],
      },
    ];
  },
};

export default nextConfig;