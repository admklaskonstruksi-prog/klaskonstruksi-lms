// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const supabase = await createClient();
    
    const { data: courses } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
    const { data: ebooks } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);

    const catalogInfo = `Katalog Kelas: ${JSON.stringify(courses || [])} \n Katalog E-Book: ${JSON.stringify(ebooks || [])}`;

    const systemPrompt = `Kamu adalah "Klas AI", asisten virtual yang ramah, profesional, dan sangat membantu untuk platform pembelajaran "Klas Konstruksi".
    Tugas utamamu membantu pengguna (user) menemukan kelas online atau e-book yang cocok seputar dunia konstruksi.
    
    Gunakan data katalog produk berikut untuk merekomendasikan kelas atau e-book:
    ${catalogInfo}
    
    Aturan:
    - Jawab dengan bahasa Indonesia santai tapi sopan.
    - Jika ditanya harga, sebutkan harganya berdasarkan data katalog.
    - Jika user bertanya di luar topik konstruksi, arahkan kembali dengan sopan.`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    // Menggunakan toTextStreamResponse sesuai versi library Anda
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Klas AI Error:", error);
    return new Response("Terjadi kesalahan pada server AI", { status: 500 });
  }
}