'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function PublishToggle({ courseId, isPublished }: { courseId: string, isPublished: boolean }) {
  const [published, setPublished] = useState(isPublished);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const newValue = !published;
    
    const { error } = await supabase.from('courses').update({ is_published: newValue }).eq('id', courseId);

    if (!error) {
      setPublished(newValue);
      router.refresh();
    } else {
      alert("Gagal mengubah status. Pastikan koneksi aman.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${published ? 'bg-[#00C9A7]' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-xs font-bold ${published ? 'text-[#00C9A7]' : 'text-gray-400'}`}>
        {published ? 'Live' : 'Draft'}
      </span>
    </div>
  );
}