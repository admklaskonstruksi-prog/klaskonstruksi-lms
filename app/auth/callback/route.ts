import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Ambil rute tujuan dari parameter 'next', default ke dashboard
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Menggunakan requestUrl.origin memastikan redirect tetap di domain yang sama (klaskonstruksi.com)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(new URL('/login?error=auth-failed', requestUrl.origin))
}