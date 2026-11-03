import { NextRequest, NextResponse } from 'next/server';
import { processTelegramCommand, formatWIB } from '@/lib/telegram';
import { getCustomers } from '@/lib/supabase';

// In-memory set for update_id deduplication (idempotency check)
const processedUpdateIds = new Set<number>();

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Secret Token Header
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'bumi_upi_webhook_secret_2026_wib';

    if (secretToken && secretToken !== expectedSecret) {
      console.warn('[Telegram Webhook] Invalid secret token received');
      return NextResponse.json({ error: 'Unauthorized secret token' }, { status: 401 });
    }

    const body = await req.json();
    const updateId = body.update_id;

    // 2. Idempotency Check
    if (updateId && processedUpdateIds.has(updateId)) {
      console.log(`[Telegram Webhook] Update ${updateId} already processed (Idempotent Skip)`);
      return NextResponse.json({ ok: true, status: 'already_processed' });
    }
    if (updateId) {
      processedUpdateIds.add(updateId);
    }

    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true, note: 'No message payload' });
    }

    const chatId = message.chat?.id;
    const fromId = message.from?.id;
    const text = message.text;
    const contact = message.contact;

    const customers = getCustomers();
    let matchedUser = customers.find(c => c.telegram_chat_id === fromId || c.telegram_chat_id === chatId);

    // 3. Handle Phone Verification via Contact Share
    if (contact && chatId) {
      if (contact.user_id && contact.user_id !== fromId) {
        // Fraud check: shared contact of someone else
        await sendTelegramReply(chatId, '⚠️ Mohon bagikan nomor kontak milik Anda sendiri yang terdaftar di perangkat ini.');
        return NextResponse.json({ ok: true });
      }

      // Valid phone verified
      const cleanPhone = contact.phone_number.replace(/\D/g, '');
      if (matchedUser) {
        matchedUser.phone = cleanPhone;
        matchedUser.is_phone_verified = true;
      }

      await sendTelegramReply(
        chatId,
        `✅ **Nomor HP Anda Berhasil Terverifikasi!**\n\nNomor: \`${contact.phone_number}\` telah resmi dihubungkan dengan akun Bumi Upi Anda.\n\nSekarang Anda dapat mengecek saldo poin (/poin), menukarkan voucher (/voucher), dan menerima struk digital setiap berkunjung ke Rumah Tamah. Hatur nuhun!`
      );
      return NextResponse.json({ ok: true, verified: true });
    }

    // 4. Handle Text Command or Query
    if (text && chatId) {
      const isStaff = matchedUser ? matchedUser.role === 'admin' || matchedUser.role === 'kasir' : false;
      const replyText = processTelegramCommand(text, matchedUser, isStaff);
      await sendTelegramReply(chatId, replyText);
    }

    return NextResponse.json({ ok: true, processed_at: formatWIB() });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]:', err);
    // Never fail silently
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to dispatch message back to Telegram API
 */
async function sendTelegramReply(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('Example')) {
    // Simulated offline log for local development/evaluation
    console.log(`[Telegram Bot Reply to Chat ${chatId}]:\n${text}`);
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.warn('[Telegram Outbound Send Failed]:', e);
  }
}
