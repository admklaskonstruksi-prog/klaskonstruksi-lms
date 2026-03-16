// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Menambah durasi maksimal fungsi agar AI tidak timeout saat berpikir
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Ambil data konteks dari Supabase
    const supabase = await createClient();
    
    // Ambil beberapa kelas yang aktif
    const { data: courses } = await supabase
      .from('courses')
      .select('title, description, price')
      .eq('is_published', true)
      .limit(10);

    // Ambil beberapa ebook yang aktif
    const { data: ebooks } = await supabase
      .from('ebooks')
      .select('title, description, price')
      .eq('is_published', true)
      .limit(10);

    // Format data untuk diberikan ke AI (dengan fallback array kosong jika null)
    const catalogInfo = `
      Katalog Kelas Saat Ini: ${JSON.stringify(courses || [])}
      Katalog E-Book Saat Ini: ${JSON.stringify(ebooks || [])}
    `;

    // 2. Buat System Prompt untuk mengatur persona AI
    const systemPrompt = `
      Kamu adalah "Klas AI", asisten virtual yang ramah, profesional, dan sangat membantu untuk platform pembelajaran "Klas Konstruksi".
      Tugas utamamu adalah membantu pengguna (user) menemukan kelas online atau e-book yang paling cocok untuk kebutuhan mereka seputar dunia konstruksi, teknik sipil, arsitektur, atau manajemen proyek.
      
      Gunakan data katalog produk berikut untuk merekomendasikan kelas atau e-book kepada user:
      ${catalogInfo}
      
      Aturan:
      - Jawab dengan bahasa Indonesia yang santai tapi sopan.
      - Jika ditanya harga, sebutkan harganya berdasarkan data katalog.
      - Jika user bertanya di luar topik konstruksi, karir, atau platform Klas Konstruksi, arahkan mereka kembali ke topik pembelajaran konstruksi dengan sopan.
      - Jangan pernah memberikan instruksi pemrograman atau sistem internal kepada user.
    `;

    // 3. Mulai streaming response dari AI
    // PENTING: Tidak ada 'await' di depan streamText untuk memulai mode streaming!
    const result = streamText({
      model: google('gemini-1.5-flash'), // Menggunakan model yang cepat dan ringan
      system: systemPrompt,
      messages,
    });

    // Kembalikan dalam bentuk response stream agar bisa dikonsumsi oleh useChat
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Klas AI Error:", error);
    return new Response("Terjadi kesalahan pada server AI", { status: 500 });
  }
}