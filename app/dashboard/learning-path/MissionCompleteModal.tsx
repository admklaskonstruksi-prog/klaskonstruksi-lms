"use client";
export const runtime = 'nodejs';

import { useEffect, useState } from "react";
// Tambahkan useParams untuk mendeteksi ID Course dari URL
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { X, Play, ShoppingBag, Trophy, Star } from "lucide-react";
import { submitCourseRating } from "./actions"; // Import fungsi rating
import toast from "react-hot-toast";

type NextChapterInCourse = {
  id: string;
  title: string;
  courseTitle: string;
  courseId: string;
  level: number;
  price: number;
  owned: boolean;
};

export default function MissionCompleteModal({
  nextChapterInCourse,
  justCompletedChapterId,
}: {
  nextChapterInCourse: NextChapterInCourse | null;
  justCompletedChapterId: string | null;
}) {
  const router = useRouter();
  const params = useParams(); // Ambil ID Course dari URL
  const courseId = (params?.id as string) || nextChapterInCourse?.courseId;

  const [open, setOpen] = useState(false);
  
  // STATE UNTUK RATING
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isRatingDone, setIsRatingDone] = useState(false);

  useEffect(() => {
    if (justCompletedChapterId) setOpen(true);
  }, [justCompletedChapterId]);

  const handleClose = () => {
    setOpen(false);
    // Reset state rating saat ditutup
    setTimeout(() => { setIsRatingDone(false); setSelectedStar(0); }, 300);
    router.replace("/dashboard/learning-path", { scroll: false });
  };

  const handleRate = async (star: number) => {
    if (!courseId || isSubmittingRating) return;
    
    setSelectedStar(star);
    setIsSubmittingRating(true);

    try {
      const res = await submitCourseRating(courseId, star);
      if (res.error) {
        toast.error("Gagal mengirim rating: " + res.error);
        setSelectedStar(0);
      } else {
        setIsRatingDone(true);
        toast.success("Terima kasih atas penilaian Anda!");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem.");
      setSelectedStar(0);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (!open) return null;

  const formatPrice = (price: number) =>
    price > 0
      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price)
      : "Gratis";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-[#1a0505] border-2 border-green-500/50 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.2)] max-w-md w-full overflow-hidden">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 text-gray-500 hover:text-white rounded-lg transition"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <div className="p-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Mission Complete!
              </h2>
              <p className="text-gray-400 text-sm">Selamat, Anda telah menyelesaikan materi ini.</p>
            </div>
          </div>

          {/* --- AREA RATING BINTANG --- */}
          <div className="mb-6 bg-black/40 border border-green-500/20 rounded-xl p-4 text-center">
            {!isRatingDone ? (
              <>
                <p className="text-gray-300 text-sm font-bold mb-3">Seberapa puas Anda dengan materi ini?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={isSubmittingRating}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleRate(star)}
                      className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:scale-100"
                    >
                      <Star
                        size={28}
                        className={`${
                          (hoveredStar || selectedStar) >= star
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                            : "text-gray-600"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-2 animate-in zoom-in duration-300">
                 <p className="text-green-400 font-black text-sm flex items-center justify-center gap-2">
                   <Star size={18} className="fill-green-400 text-green-400"/> 
                   Ulasan {selectedStar} Bintang Tersimpan!
                 </p>
              </div>
            )}
          </div>
          {/* --- AKHIR AREA RATING --- */}

          {nextChapterInCourse ? (
            <>
              <p className="text-gray-300 text-sm mb-2">Level berikutnya di course ini:</p>
              <p className="font-bold text-white mb-1">{nextChapterInCourse.title}</p>
              <p className="text-gray-500 text-xs mb-4">{nextChapterInCourse.courseTitle}</p>
              <div className="flex flex-col gap-2">
                {nextChapterInCourse.owned ? (
                  <Link
                    href={`/dashboard/play/${nextChapterInCourse.id}`}
                    onClick={handleClose}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-green-600/20"
                  >
                    <Play size={16} /> Lanjut ke Modul Ini
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={handleClose}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingBag size={16} /> Beli Modul — {formatPrice(nextChapterInCourse.price)}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-gray-400 hover:text-white text-sm transition font-medium"
                >
                  Lihat Mission Map
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 text-sm mb-4">
                Anda telah menyelesaikan seluruh modul di kelas ini. Kunjungi Katalog untuk kelas menarik lainnya!
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/program"
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/20"
                >
                  <ShoppingBag size={16} /> Ke Katalog Program
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-gray-400 hover:text-white text-sm transition font-medium"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}