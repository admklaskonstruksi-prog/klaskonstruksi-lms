import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30; // Limit eksekusi khusus untuk AI

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response("ERROR CLOUDFLARE: Variabel GOOGLE_GENERATIVE_AI_API_KEY belum diset.", { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const body = await req.json();
    
    // Ekstrak pesan secara aman, karena Vercel AI SDK v4 kadang mengirim 'text' alih-alih 'content'
    const coreMessages = (body.messages || []).map((m: any) => ({
        role: m.role,
        content: m.content || m.text || "",
    }));

    let catalogInfo = "Katalog kosong.";
    try {
      const supabase = await createClient();
      const { data: courses } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
      const { data: ebooks } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);
      catalogInfo = `Katalog Kelas: ${JSON.stringify(courses || [])} \n Katalog E-Book: ${JSON.stringify(ebooks || [])}`;
    } catch (dbError: any) {
       console.error("DB Error:", dbError.message);
    }

    const systemPrompt = `Kamu adalah "Klas AI", asisten virtual yang ramah untuk "Klas Konstruksi".
    Tugas utamamu membantu pengguna menemukan kelas online atau e-book yang cocok.
    Katalog: ${catalogInfo}
    Aturan: Jawab dengan bahasa Indonesia santai tapi sopan. Buat jawaban singkat, jelas, dan hindari format tebal/markdown yang berlebihan.`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: coreMessages,
    });

    // MENGGUNAKAN toTextStreamResponse() SESUAI PESAN ERROR TYPESCRIPT KAMU
    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error("🔴 KLAS AI ERROR:", error);
    return new Response("ERROR SISTEM AI: " + (error.message || String(error)), { status: 500 });
  }
}