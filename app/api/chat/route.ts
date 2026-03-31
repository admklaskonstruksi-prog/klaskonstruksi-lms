import { streamText, convertToModelMessages } from 'ai';
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

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: modelMessages,
    });

    // Wajib untuk @ai-sdk/react v3 + DefaultChatTransport (bukan toDataStreamResponse legacy)
    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔴 KLAS AI ERROR:", error);
    return new Response("ERROR SISTEM AI: " + message, { status: 500 });
  }
}