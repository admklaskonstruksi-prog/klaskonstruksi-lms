"use client";

interface BunnyPlayerProps {
  videoId: string;
  title?: string;
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyPlayerProps) {
  // Library ID Kelas Konstruksi Anda
  const LIBRARY_ID = "594715"; 

  // Mencegah error jika komponen dipanggil sebelum videoId tersedia
  if (!videoId) return null;

  return (
    <div className="relative w-full pt-[56.25%] bg-black overflow-hidden border border-gray-800">
      <iframe
        // Hapus parameter responsive=true karena terkadang memicu blank screen jika script bunny tidak di-load
        // Ubah autoplay=true agar saat user klik materi, video langsung jalan
        src={`https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=true&loop=false&muted=false&preload=true`}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
        title={title || "Video Player"}
      ></iframe>
    </div>
  );
}