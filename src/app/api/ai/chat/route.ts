import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.message || '';
    const userContext = body.userContext || null;

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const result = await sendChatMessage(prompt, userContext);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AI Chat Route Error]:', error);
    return NextResponse.json({
      reply: 'Sampurasun! Ada sedikit kendala koneksi ke pelayan dapur digital kami. Silakan coba sesaat lagi atau kontak WhatsApp 0812-2334-4550 ya.',
      provider: 'local_knowledge',
      latencyMs: 150
    });
  }
}
