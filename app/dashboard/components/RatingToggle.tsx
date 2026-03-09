'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface RatingToggleProps {
  id: string;
  initialUseDummy: boolean;
  tableName: 'courses' | 'ebooks';
}

export default function RatingToggle({ id, initialUseDummy, tableName }: RatingToggleProps) {
  const [useDummy, setUseDummy] = useState(initialUseDummy);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const newValue = !useDummy;
    
    // Update ke database (courses atau ebooks)
    const { error } = await supabase
      .from(tableName)
      .update({ use_dummy_rating: newValue })
      .eq('id', id);

    if (!error) {
      setUseDummy(newValue);
      router.refresh(); // Refresh data halaman admin
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-bold ${!useDummy ? 'text-[#00C9A7]' : 'text-gray-400'}`}>Asli</span>
      
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useDummy ? 'bg-[#F97316]' : 'bg-gray-200'}`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useDummy ? 'translate-x-6' : 'translate-x-1'}`} 
        />
      </button>
      
      <span className={`text-xs font-bold ${useDummy ? 'text-[#F97316]' : 'text-gray-400'}`}>Dummy</span>
    </div>
  );
}