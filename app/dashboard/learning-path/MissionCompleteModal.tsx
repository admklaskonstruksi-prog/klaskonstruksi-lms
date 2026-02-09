"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Play, ShoppingBag, Trophy } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (justCompletedChapterId) setOpen(true);
  }, [justCompletedChapterId]);

  const handleClose = () => {
    setOpen(false);
    router.replace("/dashboard/learning-path", { scroll: false });
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
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Mission Complete!
              </h2>
              <p className="text-gray-400 text-sm">Selamat, modul ini selesai.</p>
            </div>
          </div>

          {nextChapterInCourse ? (
            <>
              <p className="text-gray-300 text-sm mb-2">
                Level berikutnya di course ini:
              </p>
              <p className="font-bold text-white mb-1">{nextChapterInCourse.title}</p>
              <p className="text-gray-500 text-xs mb-4">{nextChapterInCourse.courseTitle}</p>
              <div className="flex flex-col gap-2">
                {nextChapterInCourse.owned ? (
                  <Link
                    href={`/dashboard/play/${nextChapterInCourse.id}`}
                    onClick={handleClose}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition"
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
                  className="w-full py-2.5 text-gray-400 hover:text-white text-sm transition"
                >
                  Lihat Mission Map
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 text-sm mb-4">
                Tidak ada modul lanjutan di course ini. Kunjungi Marketplace untuk beli course lain.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag size={16} /> Ke Marketplace
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-gray-400 hover:text-white text-sm transition"
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
