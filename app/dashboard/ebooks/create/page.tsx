export const runtime = 'edge';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEbookPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    
    // Panggil server action atau API route untuk handle upload PDF ke Supabase
    // const result = await createEbookAction(formData);

    setIsUploading(false);
    // router.push('/dashboard/courses'); // Redirect setelah sukses
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buat E-Book Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Judul E-Book</label>
          <input type="text" name="title" required className="w-full border p-2 rounded" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
          <input type="number" name="price" required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">File PDF E-Book</label>
          <input 
            type="file" 
            name="pdf_file" 
            accept="application/pdf" 
            required 
            className="w-full border p-2 rounded" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isUploading ? 'Mengunggah...' : 'Simpan E-Book'}
        </button>
      </form>
    </div>
  );
}