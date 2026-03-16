// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. CEK API KEY DI DALAM FUNGSI (PENTING UNTUK CLOUDFLARE)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response("ERROR CLOUDFLARE: Variabel GOOGLE_GENERATIVE_AI_API_KEY belum dimasukkan di setting dashboard Cloudflare.", { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const { messages } = await req.json();

    // 2. CEK SUPABASE DENGAN TRY-CATCH TERPISAH
    let catalogInfo = "Katalog kosong.";
    try {
      const supabase = await createClient();
      const { data: courses } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
      const { data: ebooks } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);
      catalogInfo = `Katalog Kelas: ${JSON.stringify(courses || [])} \n Katalog E-Book: ${JSON.stringify(ebooks || [])}`;
    } catch (dbError: any) {
       // Jika error karena koneksi database
       return new Response("ERROR SUPABASE: " + dbError.message, { status: 500 });
    }

    const systemPrompt = `Kamu adalah "Klas AI", asisten virtual yang ramah untuk "Klas Konstruksi".
    Tugas utamamu membantu pengguna menemukan kelas online atau e-book yang cocok.
    Katalog: ${catalogInfo}
    Aturan: Jawab dengan bahasa Indonesia santai tapi sopan.`;

    // 3. JALANKAN AI
    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return (result as any).toDataStreamResponse();
    
  } catch (error: any) {
    // JIKA ADA ERROR LAIN, TAMPILKAN KE BROWSER
    console.error("🔴 KLAS AI ERROR:", error);
    return new Response("ERROR SISTEM AI: " + (error.message || String(error)), { status: 500 });
  }
}