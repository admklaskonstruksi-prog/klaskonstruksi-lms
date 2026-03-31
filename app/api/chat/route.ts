import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response("ERROR CLOUDFLARE: Variabel GOOGLE_GENERATIVE_AI_API_KEY belum diset.", { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const body = await req.json();
    
    // Format pesan aman
    const coreMessages = (body.messages || []).map((m: any) => {
        let textContent = m.content || m.text || "";
        if (m.parts && m.parts.length > 0) {
            textContent = m.parts.map((p: any) => p.text).join(' ');
        }
        return { role: m.role, content: textContent };
    });

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
    Aturan: Jawab dengan bahasa Indonesia santai tapi sopan. Buat jawaban singkat dan jelas.`;

    // AWAIT ditambahkan agar tidak bentrok dengan versi SDK lama
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: coreMessages,
    });

    // Deteksi metode otomatis (Anti-Crash)
    const res = result as any;
    if (typeof res.toDataStreamResponse === 'function') {
        return res.toDataStreamResponse();
    } else if (typeof res.toTextStreamResponse === 'function') {
        return res.toTextStreamResponse();
    } else if (typeof res.toAIStreamResponse === 'function') {
        return res.toAIStreamResponse();
    } else {
        throw new Error("Metode Stream Response tidak ditemukan.");
    }
    
  } catch (error: any) {
    console.error("🔴 KLAS AI ERROR:", error);
    return new Response("ERROR SISTEM AI: " + (error.message || String(error)), { status: 500 });
  }
}