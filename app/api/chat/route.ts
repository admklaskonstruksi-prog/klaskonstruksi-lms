import { streamText, convertToModelMessages } from 'ai';
import { createGroq } from '@ai-sdk/groq'; // Berubah ke Groq
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 1. Menggunakan API Key dari Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response("ERROR CLOUDFLARE: Variabel GROQ_API_KEY belum diset di .env", { status: 500 });
    }

    const groq = createGroq({ apiKey });
    const body = await req.json();
    const uiMessages = body.messages ?? [];

    let catalogInfo = "Katalog kosong.";
    try {
      const supabase = await createClient();
      const { data: courses } = await supabase.from('courses').select('title, description, price').eq('is_published', true).limit(10);
      const { data: ebooks } = await supabase.from('ebooks').select('title, description, price').eq('is_published', true).limit(10);
      catalogInfo = `Katalog Kelas: ${JSON.stringify(courses || [])} \n Katalog E-Book: ${JSON.stringify(ebooks || [])}`;
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("DB Error:", msg);
    }

    const systemPrompt = `Kamu adalah "Klas AI", asisten virtual yang ramah untuk "Klas Konstruksi". Tugas utamamu membantu pengguna menemukan kelas online atau e-book yang cocok. Katalog: ${catalogInfo}. Aturan: Jawab dengan bahasa Indonesia santai tapi sopan. Buat jawaban singkat dan jelas.`;

    const modelMessages = await convertToModelMessages(uiMessages);

    // 2. Menggunakan Model LLaMA 3 dari Groq (Super Cepat & Gratis)
    const modelId = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

    const result = streamText({
      model: groq(modelId),
      system: systemPrompt,
      messages: modelMessages,
    });

    // 3. Mengembalikan Stream (Frontend KlasAIWidget tidak perlu diubah!)
    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔴 KLAS AI ERROR:", error);
    return new Response("ERROR SISTEM AI: " + message, { status: 500 });
  }
}