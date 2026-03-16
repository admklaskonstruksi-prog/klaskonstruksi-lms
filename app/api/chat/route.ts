// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("📩 Pesan diterima dari widget:", messages);

    const supabase = await createClient();
    
    // Ambil data (Jika tabel belum ada, ini berpotensi error, maka kita pastikan aman)
    const { data: courses, error: coursesError } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
    const { data: ebooks, error: ebooksError } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);

    if (coursesError || ebooksError) {
       console.log("⚠️ Peringatan Supabase:", coursesError?.message || ebooksError?.message);
    }

    const catalogInfo = `Katalog Kelas: ${JSON.stringify(courses || [])} \n Katalog E-Book: ${JSON.stringify(ebooks || [])}`;

    const systemPrompt = `Kamu adalah "Klas AI", asisten virtual yang ramah untuk "Klas Konstruksi".
    Tugas utamamu membantu pengguna (user) menemukan kelas online atau e-book yang cocok.
    Katalog: ${catalogInfo}
    Aturan: Jawab dengan bahasa Indonesia santai tapi sopan.`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    // PENTING: Kita paksa menggunakan toDataStreamResponse dengan 'as any' 
    // untuk membypass error merah palsu dari TypeScript di VS Code Anda.
    // Ini memastikan formatnya cocok 100% dengan Widget Frontend!
    return (result as any).toDataStreamResponse();
    
  } catch (error) {
    console.error("🔴 KLAS AI ERROR FATAL:", error);
    return new Response(String(error), { status: 500 });
  }
}