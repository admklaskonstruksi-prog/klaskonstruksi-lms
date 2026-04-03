import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY belum diatur di Environment Variables.");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Akses Ditolak. Kunci Salah.', { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Kredensial Supabase (URL atau Service Key) belum diatur.");
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: inactiveProfiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('send_reminder', true)
      .in('role', ['student', 'siswa'])
      .lt('last_active_at', threeDaysAgo.toISOString());

    if (error) throw error;
    if (!inactiveProfiles || inactiveProfiles.length === 0) {
        return NextResponse.json({ message: "Aman! Semua siswa aktif belajar hari ini." });
    }

    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // --- BAGIAN INI KITA PERKETAT AGAR RESEND MENGELUARKAN ERROR ASLINYA ---
    const emailPromises = inactiveProfiles.map(async (profile) => {
         const userAuth = authUsers.find(u => u.id === profile.id);
         if (!userAuth || !userAuth.email) return null;

         const { data, error: resendError } = await resend.emails.send({
          from: 'Klas Konstruksi <halo@klaskonstruksi.com>',
             to: userAuth.email, // Pastikan ini SAMA PERSIS dengan email akun Resend kamu
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

         // Jika Resend menolak, kita lemparkan error-nya ke layar!
         if (resendError) {
             throw new Error(`Resend menolak pengiriman ke ${userAuth.email}: ${resendError.message}`);
         }
         return data;
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ message: `Selesai! Berhasil mengirim ${inactiveProfiles.length} email pengingat.` });

  } catch (err: any) {
    // Error akan tertangkap di sini dan dikembalikan ke terminal
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}