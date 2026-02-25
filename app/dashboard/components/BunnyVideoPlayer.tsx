"use client";

interface BunnyPlayerProps {
  videoId: string;
  title?: string;
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyPlayerProps) {
  const LIBRARY_ID = "606426"; 

  if (!videoId) return <div className="p-10 text-white">Video ID tidak ditemukan.</div>;

  // URL Embed Bunny
  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true`;

  return (
    <div className="w-full flex flex-col h-full bg-black">
      {/* --- DEBUGGER: Baris ini untuk mengecek apakah ID dari database masuk. 
          Nanti bisa dihapus kalau video sudah jalan --- */}
      <div className="bg-red-500 text-white text-[10px] p-1 text-center">
        DEBUG - Mencoba memutar Video ID: {videoId}
      </div>

      <div className="relative w-full flex-1 min-h-[300px] md:min-h-[450px]">
        <iframe
          src={embedUrl}
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          title={title || "Video Player"}
        ></iframe>
      </div>
    </div>
  );
}