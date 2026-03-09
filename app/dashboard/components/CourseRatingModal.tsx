'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface CourseRatingModalProps {
  itemId: string;
  itemType: 'course' | 'ebook';
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseRatingModal({ itemId, itemType, userId, isOpen, onClose }: CourseRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      rating: rating,
      review_text: review
    });

    setIsSubmitting(false);

    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      alert("Gagal mengirim rating. Anda mungkin sudah pernah memberikan rating.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {!isSuccess && (
          <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        )}

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="fill-current" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Terima Kasih!</h3>
            <p className="text-gray-500">Penilaian Anda sangat berharga bagi kami.</p>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Selamat! 🎉</h3>
            <p className="text-gray-500 text-sm mb-8">Anda telah menyelesaikan materi ini. Bagaimana pengalaman belajar Anda?</p>

            {/* Bintang Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={40} 
                    className={`${
                      (hoveredRating || rating) >= star 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'fill-gray-100 text-gray-200'
                    } transition-colors duration-150`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tulis ulasan Anda di sini (opsional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl mb-6 text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none resize-none h-24 bg-gray-50 focus:bg-white transition-colors"
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`w-full font-bold py-4 rounded-xl transition-all ${
                rating === 0 || isSubmitting 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#00C9A7] text-white shadow-lg shadow-[#00C9A7]/20 hover:bg-[#00b395]'
              }`}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}