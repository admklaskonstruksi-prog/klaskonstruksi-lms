'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface EbookPublishToggleProps {
  ebookId: string;
  isPublished: boolean;
}

export default function EbookPublishToggle({ ebookId, isPublished }: EbookPublishToggleProps) {
  const [published, setPublished] = useState(isPublished);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const newValue = !published;
    
    const { error } = await supabase
      .from('ebooks')
      .update({ is_published: newValue })
      .eq('id', ebookId);

    if (!error) {
      setPublished(newValue);
      router.refresh(); // Memperbarui data di tabel admin secara real-time
    } else {
      console.error("Gagal mengubah status publish", error);
      alert("Gagal mengubah status. Silakan coba lagi.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${published ? 'bg-blue-600' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} 
        />
      </button>
      <span className={`text-xs font-bold ${published ? 'text-blue-600' : 'text-gray-400'}`}>
        {published ? 'Publik' : 'Draft'}
      </span>
    </div>
  );
}