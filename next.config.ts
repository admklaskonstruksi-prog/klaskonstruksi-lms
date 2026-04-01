import type { NextConfig } from "next";

// 1. Aturan Ketat namun Aman untuk Supabase & Groq AI
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in;
  media-src 'self' https://*.supabase.co;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// 2. Kumpulan Security Headers Standar Industri (Untuk Nilai A+)
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

const nextConfig: NextConfig = {
  // Pengaturan bawaan kamu (TIDAK ADA YANG DIHAPUS)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@lottiefiles/react-lottie-player"],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  
  // 3. Injeksi Header Keamanan ke Seluruh Halaman
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;