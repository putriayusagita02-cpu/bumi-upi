import { NextRequest, NextResponse } from 'next/server';
import {
  formatTelegramReceipt,
  formatKitchenNotification,
  TelegramReceiptPayload,
  KitchenTicketPayload
} from '@/lib/telegramHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'kitchen') {
      const formatted = formatKitchenNotification(data as KitchenTicketPayload);
      return NextResponse.json({
        success: true,
        type: 'kitchen',
        bot: '@BumiUpiBot',
        formattedMessage: formatted,
        timestampWib: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
      });
    }

    // Default: Transaction receipt
    const formatted = formatTelegramReceipt(data as TelegramReceiptPayload);
    return NextResponse.json({
      success: true,
      type: 'receipt',
      bot: '@BumiUpiBot',
      formattedMessage: formatted,
      timestampWib: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid payload' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    bot: '@BumiUpiBot',
    supportedTypes: ['receipt', 'kitchen'],
    timezone: 'Asia/Jakarta (WIB)'
  });
}
