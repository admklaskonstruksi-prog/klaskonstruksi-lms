"use client";

interface BunnyPlayerProps {
  videoId: string;
  title?: string;
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyPlayerProps) {
  // Ganti 'libraryId' ini dengan ID Library Anda (ada di .env.local)
  // Tapi karena ini Client Component, kita hardcode atau pass via props lebih aman.
  // Untuk praktis, kita ambil dari props atau .env public (nanti kita atur).
  // SEMENTARA: Kita gunakan embed URL standar Bunny.
  
  // PENTING: Untuk embed Bunny, kita butuh LIBRARY ID di URL embed.
  // Contoh: https://iframe.mediadelivery.net/embed/{LIBRARY_ID}/{VIDEO_ID}
  
  // Kita perlu cara mengoper Library ID ke sini. 
  // Opsi tercepat: Hardcode Library ID Anda di sini (Aman untuk embed player)
  const LIBRARY_ID = "594715"; // <-- CEK LIBRARY ID ANDA DI BUNNY (Video Library ID)

  return (
    <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
        title={title || "Video Player"}
      ></iframe>
    </div>
  );
}