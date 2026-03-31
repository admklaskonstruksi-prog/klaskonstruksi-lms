"use client";
export const runtime = 'nodejs';

interface BunnyPlayerProps {
  videoId: string;
  title?: string;
}

export default function BunnyVideoPlayer({ videoId, title }: BunnyPlayerProps) {
  // LIBRARY ID SUDAH DIPERBARUI KE 614254
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "628454"; 

  // Mencegah player merender iframe jika video ID tidak ada / bernilai "null" string
  if (!videoId || videoId === "null" || videoId === "undefined") {
    return (
      <div className="w-full flex flex-col h-full bg-black min-h-[300px] md:min-h-[450px] items-center justify-center border border-gray-800 rounded-xl">
         <div className="text-gray-400 font-medium bg-gray-900 px-6 py-3 rounded-lg border border-gray-700">
            Video belum diunggah untuk materi ini.
         </div>
      </div>
    );
  }

  // URL Embed Bunny
  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true`;

  return (
    <div className="w-full flex flex-col h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
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