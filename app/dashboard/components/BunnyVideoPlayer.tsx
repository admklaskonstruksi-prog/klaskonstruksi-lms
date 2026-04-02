"use client";

import { AlertCircle } from "lucide-react";

interface BunnyVideoPlayerProps {
  videoId: string;
  title?: string; 
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyVideoPlayerProps) {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

  // 1. CEK KETAT: Mencegah hantu "undefined" masuk ke iframe
  if (!videoId || videoId === "undefined" || videoId === "null") {
    return (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4 text-center rounded-xl border border-gray-800">
        <AlertCircle size={32} className="mb-2 text-yellow-500" />
        <p className="text-sm font-bold text-gray-200">Video Tidak Valid / Belum Diatur</p>
        <p className="text-xs mt-1 text-gray-500 max-w-xs">
          ID Video rusak atau kosong. Silakan klik "Edit Materi", pilih ulang video dari Library, dan Simpan.
        </p>
      </div>
    );
  }

  // 2. CEK LIBRARY ID
  if (!libraryId) {
    return (
      <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-red-950 text-red-400 p-4 text-center rounded-xl">
        <AlertCircle size={32} className="mb-2 text-red-500" />
        <p className="text-sm font-bold">Error Sistem</p>
        <p className="text-xs mt-1 text-red-300">NEXT_PUBLIC_BUNNY_LIBRARY_ID belum diatur.</p>
      </div>
    );
  }

  // 3. RENDER PLAYER JIKA SEMUA DATA VALID
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        title={title || "Video Pembelajaran"}
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      ></iframe>
    </div>
  );
}