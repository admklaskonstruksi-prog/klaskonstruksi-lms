"use client";
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ActivityTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const updateActivity = async () => {
      const supabase = createClient();

      // Gunakan localStorage agar kita tidak melakukan spam update ke database setiap kali user pindah halaman. Cukup 1x sehari.
      const lastUpdated = localStorage.getItem('last_active_date');
      const today = new Date().toDateString();

      if (lastUpdated !== today) {
        await supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', userId);
        localStorage.setItem('last_active_date', today);
      }
    };

    if (userId) updateActivity();
  }, [userId]);

  return null; // Komponen ini invisible (tidak muncul di layar)
}