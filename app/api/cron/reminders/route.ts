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

    const now = new Date();
    
    // Syarat 1: Minimal bolos 3 hari
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);

    // Syarat 2: Frekuensi pengingat (Siswa maksimal hanya diingatkan 30 hari sekali)
    const REMINDER_FREQUENCY_DAYS = 30; 
    const minTimeBetweenReminders = new Date();
    minTimeBetweenReminders.setDate(now.getDate() - REMINDER_FREQUENCY_DAYS);

    // Cari siswa yang:
    // 1. send_reminder = true
    // 2. role = student ATAU siswa
    // 3. last_active_at < 3 hari yang lalu (bolos > 3 hari)
    // 4. last_reminded_at IS NULL (belum pernah diingatkan) ATAU last_reminded_at < 30 hari yang lalu
    const { data: inactiveProfiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, last_reminded_at')
      .eq('send_reminder', true)
      .in('role', ['student', 'siswa'])
      .lt('last_active_at', threeDaysAgo.toISOString()) 
      .or(`last_reminded_at.is.null, last_reminded_at.lt.${minTimeBetweenReminders.toISOString()}`); 

    if (error) throw error;
    if (!inactiveProfiles || inactiveProfiles.length === 0) {
        return NextResponse.json({ message: "Aman! Tidak ada siswa yang perlu diingatkan saat ini." });
    }

    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const emailPromises = inactiveProfiles.map(async (profile) => {
         const userAuth = authUsers.find(u => u.id === profile.id);
         if (!userAuth || !userAuth.email) return null;

         const { error: resendError } = await resend.emails.send({
             from: 'Klas Konstruksi <support@klaskonstruksi.com>', // Sesuaikan email admin-mu
             to: userAuth.email,
             subject: 'Sobat Klas, Yuk Lanjutkan Belajarmu! 🚀',
             html: `
                <div style="font-family: sans-serif; max-w: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                  <h2 style="color: #111;">Halo ${profile.full_name || 'Sobat Klas'},</h2>
                  <p style="color: #555; line-height: 1.5;">Kami perhatikan kamu belum melanjutkan belajarmu selama 3 hari terakhir. Jangan biarkan semangatmu luntur ya!</p>
                  <p style="color: #555; line-height: 1.5;">Yuk login sekarang dan selesaikan materi yang masih tertunda.</p>
                  <a href="https://klaskonstruksi.com/login" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background-color: #00C9A7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Lanjutkan Belajar</a>
                </div>
             `
         });

         // Catat tanggal pengiriman ke database jika berhasil
         if (!resendError) {
             await supabase
               .from('profiles')
               .update({ last_reminded_at: new Date().toISOString() })
               .eq('id', profile.id);
         } else {
             console.error(`Gagal mengirim email ke ${userAuth.email}:`, resendError);
         }
         
         return true;
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ message: `Selesai! Mengirim ${inactiveProfiles.length} email pengingat.` });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}