import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. PINDAHKAN INISIALISASI RESEND KE DALAM SINI!
    // Ini mencegah error "Missing API Key" saat proses build di Cloudflare
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY belum diatur di Environment Variables.");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. VERIFIKASI KEAMANAN
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Akses Ditolak. Kunci Salah.', { status: 401 });
    }

    // 3. KONEKSI SUPABASE DENGAN MASTER KEY
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Kredensial Supabase (URL atau Service Key) belum diatur.");
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. HITUNG MUNDUR 3 HARI
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 5. CARI SISWA YANG BOLOS > 3 HARI DAN MENGIZINKAN NOTIFIKASI
    const { data: inactiveProfiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('send_reminder', true)
      .eq('role', 'student')
      .lt('last_active_at', threeDaysAgo.toISOString());

    if (error) throw error;
    if (!inactiveProfiles || inactiveProfiles.length === 0) {
        return NextResponse.json({ message: "Aman! Semua siswa aktif belajar hari ini." });
    }

    // 6. AMBIL DATA EMAIL ASLI DARI AUTH SUPABASE
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // 7. EKSEKUSI PENGIRIMAN EMAIL MASSAL
    const emailPromises = inactiveProfiles.map(async (profile) => {
         const userAuth = authUsers.find(u => u.id === profile.id);
         if (!userAuth || !userAuth.email) return null;

         return resend.emails.send({
             from: 'Klas Konstruksi <onboarding@resend.dev>', // Ganti jika domain sudah verified
             to: userAuth.email,
             subject: 'Sobat Klas, Yuk Lanjutkan Belajarmu! 🚀',
             html: `
                <div style="font-family: sans-serif; max-w: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                  <h2 style="color: #111;">Halo ${profile.full_name || 'Sobat Klas'},</h2>
                  <p style="color: #555; line-height: 1.5;">Kami perhatikan kamu belum melanjutkan belajarmu selama 3 hari terakhir. Jangan biarkan semangatmu luntur ya!</p>
                  <p style="color: #555; line-height: 1.5;">Yuk login sekarang dan lanjutkan materi yang belum selesai.</p>
                  <a href="https://klaskonstruksi.com/login" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #00C9A7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Lanjutkan Belajar</a>
                </div>
             `
         });
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ message: `Selesai! Berhasil mengirim ${inactiveProfiles.length} email pengingat.` });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}