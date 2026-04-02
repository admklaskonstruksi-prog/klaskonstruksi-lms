"use client";

import { AlertCircle } from "lucide-react";

// KITA TAMBAHKAN INTERFACE AGAR TYPESCRIPT TIDAK PROTES
interface BunnyVideoPlayerProps {
  videoId: string;
  title?: string; // Tanda tanya (?) artinya opsional
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyVideoPlayerProps) {
  // Wajib menggunakan NEXT_PUBLIC_ agar terbaca oleh browser
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

  if (!videoId) {
    return (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4 text-center">
        <p className="text-sm font-medium">Video belum diunggah untuk materi ini.</p>
      </div>
    );
  }

  if (!libraryId) {
    return (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-red-950 text-red-400 p-4 text-center">
        <AlertCircle size={32} className="mb-2 text-red-500" />
        <p className="text-sm font-bold">Error Sistem</p>
        <p className="text-xs mt-1 text-red-300">NEXT_PUBLIC_BUNNY_LIBRARY_ID belum diatur.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        title={title || "Video Pembelajaran"} // Sekalian kita gunakan title-nya di sini
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      ></iframe>
    </div>
  );
}