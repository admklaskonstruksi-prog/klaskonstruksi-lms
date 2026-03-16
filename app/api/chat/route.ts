// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

// HAPUS BARIS 'edge' RUNTIME!
// Vercel AI SDK versi terbaru sudah sangat optimal di runtime Node.js bawaan OpenNext
export const maxDuration = 30; // Biarkan maxDuration jika sewaktu-waktu pindah ke Vercel

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const supabase = await createClient();
    
    // Ambil data dengan perlindungan error
    const { data: courses } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
    const { data: ebooks } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);

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

    return (result as any).toDataStreamResponse();
    
  } catch (error) {
    console.error("🔴 KLAS AI ERROR FATAL:", error);
    return new Response(String(error), { status: 500 });
  }
}