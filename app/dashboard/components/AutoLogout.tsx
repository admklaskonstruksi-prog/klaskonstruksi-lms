'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Waktu inaktif: 30 menit
  const TIMEOUT_DURATION = 30 * 60 * 1000;

  const handleLogout = useCallback(async () => {
    try { 
      // Pastikan endpoint ini sesuai dengan yang ada di kodemu (biasanya POST ke /auth/signout)
      await fetch('/auth/signout', { method: 'POST' }); 
      router.push('/login');
      router.refresh(); 
    } catch (error) {
      console.error('Gagal melakukan auto-logout', error);
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
  }, [handleLogout]);

  useEffect(() => {
    const activeEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    activeEvents.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activeEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return <>{children}</>;
}