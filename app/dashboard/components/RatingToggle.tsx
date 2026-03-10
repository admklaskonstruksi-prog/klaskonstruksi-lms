'use client';

import { useState, useTransition } from 'react';
import { toggleDummyRating } from '../courses/actions';
import toast from 'react-hot-toast';

interface RatingToggleProps {
  id: string;
  initialUseDummy: boolean;
  tableName: 'courses' | 'ebooks';
}

export default function RatingToggle({ id, initialUseDummy, tableName }: RatingToggleProps) {
  const [useDummy, setUseDummy] = useState(initialUseDummy);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newValue = !useDummy;
    
    // 1. Optimistic Update: Geser tombol seketika agar terasa instan dan cepat
    setUseDummy(newValue);
    
    // 2. Eksekusi ke database di latar belakang
    startTransition(async () => {
      // Pastikan path ke actions sudah benar sesuai struktur foldermu
      const result = await toggleDummyRating(id, tableName, newValue);
      
      if (result?.error) {
        // Jika ternyata gagal simpan di database, kembalikan posisi tombol seperti semula
        setUseDummy(!newValue);
        toast.error("Gagal mengubah rating: " + result.error);
      } else {
        toast.success(`Berhasil menggunakan rating ${newValue ? 'Dummy' : 'Asli'}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-bold ${!useDummy ? 'text-[#00C9A7]' : 'text-gray-400'}`}>Asli</span>
      
      <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${useDummy ? 'bg-[#F97316]' : 'bg-gray-200'}`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${useDummy ? 'translate-x-6' : 'translate-x-1'}`} 
        />
      </button>
      
      <span className={`text-xs font-bold ${useDummy ? 'text-[#F97316]' : 'text-gray-400'}`}>Dummy</span>
    </div>
  );
}