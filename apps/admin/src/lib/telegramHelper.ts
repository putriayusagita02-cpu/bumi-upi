/**
 * Telegram Bot Receipt and Notification Helper for @BumiUpiBot
 * Formats official transaction receipts and kitchen dispatch alerts in WIB (Asia/Jakarta)
 */

export interface ReceiptItem {
  itemName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TelegramReceiptPayload {
  orderNumber: string;
  customerName: string;
  customerTier: string;
  tableNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  pointsEarned: number;
  newPointsBalance: number;
  paymentMethod: string;
  cashierName?: string;
  timeWib?: string;
}

export interface KitchenTicketPayload {
  orderNumber: string;
  tableNumber: string;
  orderType: 'dine_in' | 'takeaway';
  items: { itemName: string; variantName?: string; quantity: number; notes?: string }[];
  notes?: string;
  timeWib?: string;
}

export function getWibTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\./g, ':');
}

export function formatTelegramReceipt(data: TelegramReceiptPayload): string {
  const timeStr = data.timeWib || `${getWibTimestamp()} WIB`;
  const formattedItems = data.items.map(
    (i) => `• ${i.itemName}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity} = Rp ${i.subtotal.toLocaleString('id-ID')}`
  );

  const lines = [
    '🌿 *STRUK TRANSAKSI RESMI — BUMI UPI*',
    `No: \`${data.orderNumber}\``,
    `Waktu: ${timeStr}`,
    `Pelanggan: ${data.customerName} (${data.customerTier})`,
    `Meja / Tipe: ${data.tableNumber}`,
    `Kasir: ${data.cashierName || 'Kang Asep (Kasir Utama)'}`,
    '---------------------------------',
    ...formattedItems,
    '---------------------------------',
    `Subtotal: Rp ${data.subtotal.toLocaleString('id-ID')}`,
    data.discountAmount > 0 ? `Diskon Voucher: -Rp ${data.discountAmount.toLocaleString('id-ID')}` : null,
    `Total Pembayaran: *Rp ${data.finalAmount.toLocaleString('id-ID')}* [${data.paymentMethod.toUpperCase()}]`,
    `Poin Diperoleh: +${data.pointsEarned} Poin (Total: ${data.newPointsBalance})`,
    '---------------------------------',
    'Hatur nuhun parantos sumping ka Bumi Upi! 🙏',
    'Semoga sehat dan berkah selalu sekeluarga.'
  ].filter(Boolean) as string[];

  return lines.join('\n');
}

export function formatKitchenNotification(data: KitchenTicketPayload): string {
  const timeStr = data.timeWib || `${getWibTimestamp()} WIB`;
  const itemsText = data.items
    .map((item, idx) => `  ${idx + 1}. *${item.itemName}* x${item.quantity}${item.variantName ? ` [${item.variantName}]` : ''}${item.notes ? `\n     Catatan: _${item.notes}_` : ''}`)
    .join('\n');

  return [
    '🍳 *TIKET DAPUR MASUK — BUMI UPI*',
    `Lokasi: *${data.tableNumber}* (${data.orderType === 'dine_in' ? 'Dine-In' : 'Bungkus / Takeaway'})`,
    `Tiket No: \`${data.orderNumber}\``,
    `Waktu Terima: ${timeStr}`,
    '---------------------------------',
    'Daftar Menu yang Harus Dimasak:',
    itemsText,
    '---------------------------------',
    data.notes ? `Catatan Umum Pesanan: _${data.notes}_\n---------------------------------` : null,
    'Status: *Masuk (Segera Dimasak)*'
  ].filter(Boolean).join('\n');
}
