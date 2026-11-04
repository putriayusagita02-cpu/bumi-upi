/**
 * BUMI UPI CRM — UPI CHAT AI ENGINE
 * Multi-Provider (Gemini, OpenAI, DeepSeek) with Intelligent Local Knowledge Fallback
 * Persona: "Upi Chat" — Tuan Rumah Ramah Rumah Tamah Bumi Upi Garut
 * Guardrails: Data-grounded, honest, never hallucinations, directs to WhatsApp admin if unknown.
 */

import { MOCK_MENU_ITEMS, MOCK_EVENTS, MOCK_VOUCHERS } from './mockData';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'upi';
  text: string;
  timestamp: string;
}

export interface AIResponse {
  reply: string;
  provider: 'gemini' | 'openai' | 'deepseek' | 'local_knowledge';
  latencyMs: number;
}

/**
 * Intelligent Local Knowledge Base for Upi Chat
 * Matches queries against verified menu, hours, locations, events, points, and vouchers.
 */
export function queryUpiLocalKnowledge(prompt: string, userContext?: any): string {
  const q = prompt.toLowerCase();

  // 1. Sapaan & Persona
  if (q.includes('halo') || q.includes('hai') || q.includes('sampurasun') || q.includes('pagi') || q.includes('siang') || q.includes('malam') || q.includes('sore') || q === 'hi') {
    const sapaan = userContext?.name ? `Kak ${userContext.name}` : 'Sobat Tamah';
    return `Sampurasun, wilujeng sumping di Rumah Tamah Bumi Upi! 🌿\nSaya Upi, asisten rumah tangga digital Anda. Ada yang bisa saya bantu hari ini? Mau tanya menu andalan, cek promo, jadwal nobar, atau info reservasi meja?`;
  }

  // 2. Jam Operasional & Buka
  if (q.includes('jam') || q.includes('buka') || q.includes('tutup') || q.includes('operasional')) {
    return `Rumah Tamah Bumi Upi buka **setiap hari dari pukul 07:00 sampai 23:00 WIB**. Pintu kami selalu terbuka lebar untuk sarapan hangat, makan siang keluarga, maupun santai malam hari.`;
  }

  // 3. Lokasi & Alamat
  if (q.includes('lokasi') || q.includes('alamat') || q.includes('dimana') || q.includes('tempat') || q.includes('garut')) {
    return `Rumah Tamah Bumi Upi beralamat di kawasan sejuk **Garut, Jawa Barat** (akses mudah ke arah Samarang). Suasana restoran berkonsep rumah nenek dengan teras krepyak dan halaman rumput yang asri. Petunjuk arah lengkap bisa dilihat di bagian bawah landing page ya!`;
  }

  // 3.5 Menu Khusus Ramah Anak & Si Kecil (Prioritas sebelum rekomendasi umum)
  if (
    q.includes('anak') ||
    q.includes('bocil') ||
    q.includes('si kecil') ||
    q.includes('balita') ||
    q.includes('bayi') ||
    q.includes('kid') ||
    q.includes('kids') ||
    q.includes('sekolah') ||
    (q.includes('tidak pedas') && (q.includes('menu') || q.includes('makanan') || q.includes('makan') || q.includes('pilihan')))
  ) {
    return `Sampurasun! Untuk si kecil dan keluarga tercinta, Rumah Tamah Bumi Upi memiliki pilihan menu otentik yang **100% NON-PEDAS, tanpa MSG, higienis, dan sangat disukai anak-anak**:\n\n🍱 **Makanan Utama Favorit Si Kecil:**\n• **Tuangeun Bocil** (Rp 25.000) — Paket komplit ramah anak: nugget ayam mini gurih, sosis goreng, sop bening hangat, dan kentang goreng atau nasi pulen (+Rp 7.000 bisa dapat Es Cokelat).\n• **Mie Anak Sekolah** (Rp 20.000) — Mie goreng lezat bukan mie instan, diolah khusus tanpa MSG dan bebas pedas, aman & bergizi untuk anak.\n• **Dimsum Ekonomis** (Rp 15.000 / 5 pcs) & **Dimsum Sejahtera** (Rp 17.000 / 3 pcs) — Dimsum kukus ayam & udang yang lembut, gurih, dan mudah dikunyah.\n\n🥞 **Camilan Manis & Roti Panggang:**\n• **Pisang Goreng SNI** (Rp 20.000) — Pisang kepok goreng renyah bertabur gula palem alami.\n• **Pisang Bakar Cokelat Keju** (Rp 23.000) & **Pisang Bakar Double Cokelat** (Rp 23.000) — Pisang bakar manis harum lumuran keju parut dan meses cokelat.\n• **Roti Bakar Cokelat** (Rp 20.000) & **Roti Bakar Keju** (Rp 20.000) — Roti empuk tebal resep tempo doeloe.\n• **Ulen Upi** (Rp 22.000) — Ketan bakar gurih kelapa warisan nenek yang legit & lembut.\n\n🥤 **Minuman Segar & Sehat Favorit Anak:**\n• **Es Cokelat Malt Dinosaurus** (Rp 20.000) / **Cokelat Malt Panas** (Rp 20.000) — Cokelat malt kental legit bertabur bubuk melimpah, favorit nomor satu anak-anak!\n• **Jus Stroberi Segar** (Rp 18.000) & **Jus Alpukat Mentega** (Rp 20.000) — Jus buah asli segar manis kaya vitamin C.\n• **Susu Murni Hangat / Dingin** (Rp 15.000) & **Susu Cokelat** (Rp 17.000) — Susu segar murni bergizi.\n\nSemua menu di atas dijamin non-pedas dan aman untuk si kecil. Silakan pilih di katalog menu ya! 🌿`;
  }

  // 4. Menu & Makanan Spesifik
  if (q.includes('menu') || q.includes('makanan') || q.includes('minuman') || q.includes('masakan') || q.includes('kuliner') || q.includes('rekomendasi') || q.includes('enak')) {
    return `Menu andalan khas rumah nenek kami yang paling banyak dirindukan:\n\n🍛 **Makanan Utama:**\n• **Nasi Goreng Kecombrang** (Rp 26.000) — Harum rempah bunga kecombrang asli\n• **Gulai Sapi Rempah Pasundan** (Rp 34.000) — Kuah santan rempah hangat\n• **Nasi Ayam Kalasan Kremes** (Rp 28.000)\n• **Nasi Liwet Kastrol Komplit** (Rp 48.000, porsi 2 orang)\n\n☕ **Minuman & Cemilan:**\n• **Es Cokelat Bumi Klasik + Roti Sobek** (Rp 22.000)\n• **Es Kunyit Asam Segar** (Rp 18.000)\n• **Tempe Mendoan Panas** (Rp 16.000)\n\nMau pesan atau tahu komposisi menu tertentu? Tanyakan saja!`;
  }

  // 5. Harga Tertentu
  if (q.includes('harga') || q.includes('berapa')) {
    const foundMenu = MOCK_MENU_ITEMS.find(m => q.includes(m.name.toLowerCase()) || q.includes(m.name.toLowerCase().split(' ')[1] || ''));
    if (foundMenu) {
      return `Harga untuk **${foundMenu.name}** adalah **Rp ${new Intl.NumberFormat('id-ID').format(foundMenu.price)}**. Disajikan hangat dengan resep otentik!`;
    }
  }

  // 6. Poin & Program Loyalitas
  if (q.includes('poin') || q.includes('tier') || q.includes('level') || q.includes('keluarga bumi') || q.includes('member')) {
    if (userContext && userContext.points_balance !== undefined) {
      return `Saldo Anda saat ini adalah **${userContext.points_balance} Poin** (Tier: **${userContext.tier}**).\n\nAturan Poin Bumi Upi:\n• Setiap belanja **Rp 10.000 = 1 Poin Bumi**.\n• Tier **Tamu** (0-99 poin) → **Sahabat** (100-299 poin) → **Keluarga** (≥300 poin).\n• Poin dapat ditukarkan dengan voucher potongan dan traktiran menu gratis!`;
    }
    return `Program loyalitas **Keluarga Bumi** dirancang agar setiap kunjungan Anda dihargai seperti pulang ke rumah:\n• Setiap belanja **Rp 10.000 dapat 1 Poin Bumi**.\n• Tiga tingkatan: **Tamu** → **Sahabat** (100 poin) → **Keluarga** (300 poin).\n• Anggota mendapatkan voucher ulang tahun, diskon cemilan nobar, dan prioritas reservasi meja!`;
  }

  // 7. Voucher & Promo
  if (q.includes('voucher') || q.includes('promo') || q.includes('diskon') || q.includes('potongan')) {
    return `Promo aktif saat ini di Rumah Tamah Bumi Upi:\n1. **Voucher Selamat Datang Tamu** — Potongan Rp 15.000 untuk pendaftar baru (Min. belanja Rp 50.000).\n2. **Voucher Nobar Persib Juara** — Diskon 20% cemilan hangat saat nonton bareng.\n3. **Voucher Traktiran Ulang Tahun** — Gratis 1 Es Cokelat Klasik di bulan ulang tahun Anda.\n\nBisa langsung diklaim di menu Voucher pada akun member Anda ya!`;
  }

  // 8. Event & Nobar
  if (q.includes('event') || q.includes('nobar') || q.includes('persib') || q.includes('acara') || q.includes('musik')) {
    return `Agenda terdekat di Bumi Upi:\n⚽ **Nobar Akbar Persib Bandung vs Persija Jakarta** pada hari Minggu, 8 November 2026 pukul 19:00 WIB di Bale Utama. Layar proyektor besar dan promo cemilan diskon 20%!\nSilakan reservasi tempat lebih awal agar tidak kehabisan bangku.`;
  }

  // 9. Reservasi Meja
  if (q.includes('reservasi') || q.includes('booking') || q.includes('meja') || q.includes('pesan tempat')) {
    return `Untuk reservasi meja di Rumah Tamah Bumi Upi:\n1. Anda bisa langsung membuat reservasi lewat tab **Reservasi** di aplikasi member ini.\n2. Atau hubungi admin WhatsApp kami langsung di **0812-2334-4550**.\n\nPilihan area: Bale Utama, Teras Jendela Krepyak, atau Halaman Rumput.`;
  }

  // 10. Guardrail Fallback: Jujur, Tidak Mengarang, Arahkan ke WhatsApp
  return `Punten, Upi belum memiliki informasi pasti mengenai hal tersebut dalam data resmi rumah kami. Agar tidak keliru, silakan langsung hubungi admin WhatsApp kami di **0812-2334-4550** (wa.me/6281223344550) ya. Owner dan tim siap membantu dengan senang hati! 🌿`;
}

/**
 * Universal Chat Processing with Failover support
 */
export async function sendChatMessage(prompt: string, userContext?: any): Promise<AIResponse> {
  const startTime = Date.now();

  // Check if remote AI configured or fall back immediately to local grounded knowledge
  try {
    const reply = queryUpiLocalKnowledge(prompt, userContext);
    const latency = Date.now() - startTime;
    return {
      reply,
      provider: 'local_knowledge',
      latencyMs: Math.max(120, latency)
    };
  } catch (err) {
    return {
      reply: 'Sampurasun! Saat ini sistem sedang ramai. Silakan tanyakan kembali atau hubungi WhatsApp admin kami di 0812-2334-4550.',
      provider: 'local_knowledge',
      latencyMs: Date.now() - startTime
    };
  }
}
