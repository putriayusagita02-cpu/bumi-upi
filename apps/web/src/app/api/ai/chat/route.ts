import { NextRequest, NextResponse } from 'next/server';
import { MENU_ITEMS } from '../../../../lib/catalogData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, customerName, tier, points } = body;

    const q = (message || '').toLowerCase();

    let reply = '';

    if (!q.trim()) {
      reply = 'Sampurasun! Ada yang bisa Upi bantu hari ini seputar Rumah Tamah Bumi Upi?';
    } else if (
      q.includes('halo') ||
      q.includes('hai') ||
      q.includes('sampurasun') ||
      q.includes('pagi') ||
      q.includes('siang') ||
      q.includes('malam') ||
      q.includes('sore') ||
      q === 'hi'
    ) {
      const sapaan = customerName ? `Kak ${customerName}` : 'Sobat Tamah';
      reply = `Sampurasun, wilujeng sumping di Rumah Tamah Bumi Upi, ${sapaan}! 🌿\n\nSaya Upi, asisten ramah Anda. Mau pesan menu khas Garut, rekomendasi cemilan hangat, tanya promo voucher, atau reservasi meja di Bale Utama?`;
    } else if (q.includes('jam') || q.includes('buka') || q.includes('tutup') || q.includes('operasional')) {
      reply = `Rumah Tamah Bumi Upi buka **setiap hari dari pukul 07:00 sampai 23:00 WIB**. Pintu kami selalu terbuka lebar untuk sarapan hangat, santap siang keluarga, hingga nongkrong sore di teras krepyak.`;
    } else if (q.includes('lokasi') || q.includes('alamat') || q.includes('dimana') || q.includes('garut')) {
      reply = `Rumah Tamah Bumi Upi beralamat di kawasan asri **Garut, Jawa Barat** (akses mudah jalur sejuk Samarang). Tempat kami memiliki suasana rumah nenek dengan bale kayu, jendela krepyak klasik, dan halaman rumput hijau yang luas.`;
    } else if (
      q.includes('rekomendasi') ||
      q.includes('enak') ||
      q.includes('favorit') ||
      q.includes('menu andalan')
    ) {
      reply = `Ieu mah menu andalan juara khas Bumi Upi yang paling banyak dirindukan:\n\n🍛 **Makanan Utama:**\n• **Nasi Goreng Kecombrang** (Rp 24.000) — Harum rempah bunga kecombrang asli\n• **Lidah Sambel Hejo** (Rp 47.000) — Empuk gurih disiram sambal hejo segar\n• **Mie Kasep** (Rp 24.000) & **Mie Ebroh** (Rp 25.000)\n• **Ulen Upi** (Rp 22.000) — Ketan bakar gurih kelapa warisan nenek\n\n☕ **Minuman Segar:**\n• **Kopi Hitam** (Rp 17.000/Rp 22.000) & **Kopi Susu Santan** (Rp 23.000)\n• **Es Cincau Jadoel** (Rp 19.000)\n• **Es Cokelat Malt Dinosaurus** (Rp 20.000)\n\nBisa langsung dipilih di menu katalog ya!`;
    } else if (q.includes('pedas') || q.includes('sambal') || q.includes('hejo')) {
      reply = `Untuk pecinta pedas sejati, cobain:\n🌶️ **Nasi Buntut Rewel** (Rp 45.000)\n🌶️ **Tahu Cabe Rewel** (Rp 22.000)\n🌶️ **Cireng Tahu Gejrot** (Rp 18.000)\n🌶️ **Bebek Sambel Hejo** (Rp 45.000)\n🌶️ **Mie Racing** (Rp 25.000)\n\nPedasnya nampol tapi bikin nambah terus!`;
    } else if (q.includes('anak') || q.includes('bocil') || q.includes('tidak pedas')) {
      reply = `Untuk si kecil atau yang tidak suka pedas:\n👶 **Tuangeun Bocil** (Rp 25.000) — Nugget ayam mini, sosis goreng & kentang gurih\n👶 **Mie Anak Sekolah** (Rp 27.000) — Mie kuah sosis baso tanpa pedas\n👶 **Pisang Goreng** (Rp 20.000) & **Dimsum Ekonomis** (Rp 15.000)\n👶 **Jus Mangga / Jus Semangka** yang segar alami!`;
    } else if (q.includes('poin') || q.includes('tier') || q.includes('member') || q.includes('loyalitas')) {
      const pts = points !== undefined ? points : 142;
      const tr = tier || 'Sahabat';
      reply = `Status keanggotaan Anda saat ini: **Tier ${tr}** dengan saldo **${pts} Poin Bumi**.\n\nAturan Program Loyalitas:\n• Setiap belanja **Rp 10.000 = 1 Poin**.\n• Tier **Tamu** (0-99 poin) → **Sahabat** (100-299 poin) → **Keluarga** (≥300 poin).\n• Poin dapat dinikmati untuk potongan diskon dan traktiran menu gratis!`;
    } else if (q.includes('voucher') || q.includes('promo') || q.includes('diskon')) {
      reply = `Promo voucher aktif saat ini:\n🎟️ **BUMIWELCOME**: Potongan Rp 15.000 (Min. Rp 50.000)\n🎟️ **PERSIBJUARA**: Diskon 20% cemilan & minuman saat nobar\n🎟️ **ULTAHSUNDA**: Diskon Rp 30.000 spesial traktiran ulang tahun\n\nBisa langsung diklaim saat checkout di keranjang belanja!`;
    } else if (q.includes('nobar') || q.includes('persib') || q.includes('nonton')) {
      reply = `⚽ **Nobar Persib Bandung di Bale Utama Bumi Upi**:\nSetiap pertandingan Persib selalu kami tayangkan di layar proyektor besar. Tersedia voucher diskon 20% dan suasana riuh hangat khas bobotoh Priangan!`;
    } else if (q.includes('harga') || q.includes('berapa')) {
      const match = MENU_ITEMS.find((m) => q.includes(m.name.toLowerCase()));
      if (match) {
        reply = `Harga untuk **${match.name}** adalah **Rp ${match.price.toLocaleString('id-ID')}**. Dibuat dari bahan segar resep turun-temurun!`;
      } else {
        reply = `Katalog menu kami memiliki beragam pilihan otentik mulai dari Rp 10.000 (Es Kelapa) hingga Rp 48.000 (Pepes Ayam Kampung). Silakan cek tab **Katalog Menu** untuk daftar lengkapnya ya!`;
      }
    } else {
      reply = `Hatur nuhun atas pertanyaannya! Apabila Kakak membutuhkan informasi khusus lainnya atau ingin reservasi rombongan besar, tim kami siap melayani lewat WhatsApp Admin di **0812-2334-4550**. Wilujeng tuang di Bumi Upi! 🌿`;
    }

    return NextResponse.json({
      success: true,
      reply,
      sender: 'upi',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        reply: 'Punten, Upi sedang menyiapkan pesanan sejenak. Silakan ulangi pertanyaan Anda.',
      },
      { status: 500 }
    );
  }
}
