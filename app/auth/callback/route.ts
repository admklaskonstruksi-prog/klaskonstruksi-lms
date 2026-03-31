import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Ambil rute tujuan dari parameter 'next', default ke dashboard
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Tukar kode verifikasi dari link email dengan Sesi Login
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // --- PENYELAMATAN DATA METADATA KE TABEL PROFILES ---
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Ambil data profil saat ini (jika ada)
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, address')
          .eq('id', user.id)
          .single()
        
        // Jika profil belum ada, ATAU No HP/Kota kosong (kasus daftar manual), tarik dari metadata!
        if (!profile || !profile.phone || !profile.address) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            phone: user.user_metadata?.phone || profile?.phone || '',
            address: user.user_metadata?.address || profile?.address || '',
            role: user.user_metadata?.role || 'siswa'
          }, { onConflict: 'id' })
        }
      }

      // Gunakan x-forwarded-host agar redirect tetap stabil di Cloudflare Pages
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-failed`)
}