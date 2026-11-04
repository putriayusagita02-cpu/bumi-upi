import { NextRequest, NextResponse } from 'next/server';
import { MENU_ITEMS } from '../../../../lib/catalogData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, customerName, tier, points } = body;

    const raw = (message || '').trim();
    const q = raw.toLowerCase();

    let reply = '';

    const isKidsQuery =
      q.includes('anak') ||
      q.includes('bocil') ||
      q.includes('si kecil') ||
      q.includes('balita') ||
      q.includes('bayi') ||
      q.includes('kid') ||
      q.includes('kids') ||
      q.includes('sekolah') ||
      (q.includes('tidak pedas') && (q.includes('menu') || q.includes('makanan') || q.includes('makan') || q.includes('pilihan')));

    const isPedasQuery =
      q.includes('pedas') ||
      q.includes('lada') ||
      q.includes('sambal') ||
      q.includes('sambel') ||
      q.includes('hejo') ||
      q.includes('rewel') ||
      q.includes('cabe') ||
      q.includes('cabai') ||
      q.includes('seblak') ||
      (q.includes('pedas garut') || q.includes('menu pedas'));

    const isPhotoboothQuery =
      q.includes('photo') ||
      q.includes('foto') ||
      q.includes('photobox') ||
      q.includes('photobooth') ||
      q.includes('fotobox') ||
      q.includes('polaroid') ||
      q.includes('cetak foto');

    const isWeddingQuery =
      q.includes('nikah') ||
      q.includes('wedding') ||
      q.includes('pernikahan') ||
      q.includes('resepsi') ||
      q.includes('akad') ||
      q.includes('lamaran') ||
      q.includes('tunangan') ||
      q.includes('pricelist') ||
      q.includes('price list') ||
      q.includes('paket nikah') ||
      q.includes('venue nikah') ||
      (q.includes('paket') && (q.includes('acara') || q.includes('event') || q.includes('harga')));

    if (!q) {
      reply = 'Sampurasun! Ada yang bisa Upi bantu hari ini seputar Rumah Tamah Bumi Upi?';
    } else if (isPedasQuery) {
      // Prioritas Menu Pedas Khas Garut (Memperbaiki bug pencarian "menu pedas garut")
      reply = `Sampurasun pecinta pedas sejati! 🌶️\n\nUntuk Kakak yang mencari sensasi pedas nampol khas Dapur Garut, Bumi Upi punya sederet hidangan juara yang diracik dadakan:\n\n🔥 **Menu Utama Pedas Nampol:**\n• **Lidah Sambel Hejo** (Rp 47.000) — Lidah sapi empuk berpadu siraman ulekan sambal cabai hijau tomat segar Garut.\n• **Buntut Goreng Sambal Hejo** (Rp 45.000) — Buntut goreng gurih berkulit krispi dengan cocolan sambal hejo aromatik.\n• **Nasi Buntut Rewel** (Rp 45.000) — Kuah kaldu rempah cabai rawit rewel yang pedasnya meledak di lidah.\n• **Bebek Sambel Hejo** (Rp 45.000) — Bebek empuk gurih tanpa bau amis, diselimuti sambal hijau segar melimpah.\n• **Nasi Ayam Omongan Tetangga** (Rp 24.000) — Ayam goreng bumbu rempah dengan sambal pedas ceplas-ceplos setajam omongan tetangga!\n• **Nasi Goreng Cumi Upi** (Rp 28.000) & **Nasi Goreng Peda Kemangi** (Rp 27.000) — Nasi goreng wangi terasi & cabai rawit pedas nendang.\n\n🥢 **Camilan & Mie Pedas Garut:**\n• **Tahu Cabe Rewel** (Rp 22.000) — Tahu krispi ditumis cabai garam bawang rewel super gurih pedas.\n• **Cireng Tahu Gejrot** (Rp 18.000) — Cireng kenyal & tahu goreng berkuah asam pedas gejrot yang segar.\n• **Mie Racing** (Rp 25.000) — Mie kenyal berlevel cabai ekstra bikin melek seketika.\n• **Mie Ebroh** (Rp 25.000) — Mie kuah telur melimpah (ebroh) bertabur cabai rawit segar.\n\nPedasnya nampol bikin ketagihan! Silakan langsung pesan lewat katalog menu ya Kak! 🌿`;
    } else if (isPhotoboothQuery) {
      // Informasi Fasilitas Photobooth / Photobox Bumi Upi
      reply = `📸 **Pojok Photobox & Photobooth Vintage Bumi Upi**:\n\nKabar gembira! Di Rumah Tamah Bumi Upi terdapat fasilitas **Photobox Vintage** yang sangat viral dan estetik untuk mengabadikan momen bareng pasangan, sahabat, atau keluarga:\n\n✨ **Fasilitas & Keunggulan Photobox Bumi Upi:**\n• **Tarif Terjangkau**: Hanya **Rp 25.000** sudah dapat **2 strip cetak foto fisik** berkualitas tinggi (waterproof & tahan lama).\n• **Custom Frame Bumi Upi**: Banyak pilihan template frame retro, vintage floral, hingga edisi khusus Garut tempo doeloe.\n• **Properti Foto Lucu Gratis**: Tersedia kacamata retro, topi jadul, bando lucu, dan signage kata-kata khas Sunda.\n• **Softcopy Instan**: Dilengkapi kode QR untuk langsung download file foto digital & video GIF ke smartphone Kakak!\n• **Lokasi**: Terletak di area indoor dekat Ruang Tengah & Teras Depan.\n\nSelain untuk pengunjung harian, photobooth kami juga bisa disewa **unlimited print** untuk paket intimate wedding, lamaran, dan ulang tahun lho! 🌿`;
    } else if (isWeddingQuery) {
      // Informasi Rencana Pernikahan & Pricelist Event Bumi Upi
      reply = `💍 **Rencana Pernikahan Impian (Intimate Wedding) di Bumi Upi Garut**:\n\nBumi Upi (Jl. Cimanuk No. 312 Garut) menyediakan venue bernuansa *Heritage & Garden Intimate Wedding* yang hangat, estetik, dan berkesan ala rumah nenek yang syahdu.\n\n📋 **Pricelist Paket Pernikahan Resmi Bumi Upi:**\n\n1️⃣ **Paket Akad & Syukuran Intimate (50 Tamu)** — **Rp 14.500.000**\n• Venue Eksklusif 4 Jam (Teras Vintage & Ruang Tengah Indoor)\n• Buffet Prasmanan 50 Pax menu Dapur Nenek\n• Meja Ijab Qabul & Dekorasi Akad Minimalis Modern\n• 📸 **Photobox Unlimited 2 Jam** frame custom nama pengantin\n• Sound system standar & mic wireless\n\n2️⃣ **Paket Intimate Garden & Heritage (100 Tamu)** ⭐ *Paling Favorit* — **Rp 28.500.000**\n• Full Venue 6 Jam (Indoor Vintage House + Taman Rumput Hijau + Bale Riung)\n• Buffet Prasmanan 100 Pax + 2 Food Stall (Gorengan Darmaji & Es Cincau Jadoel)\n• Pelaminan Rustic Sunda Heritage berlatar Pintu Kayu Klasik Viral\n• 📸 **Photobox Unlimited 3 Jam + Properti Vintage + Softcopy Digital Google Drive**\n• Sound system pro & alunan musik akustik / kecapi suling\n• MC Pernikahan & Ruang Rias Pengantin ber-AC\n\n3️⃣ **Paket Pesta Riung Istimewa (200 Tamu)** — **Rp 48.000.000**\n• Full Venue Seharian (8 Jam)\n• Buffet Prasmanan 200 Pax + 4 Food Stall Spesial (Kambing Guling, Mie Racing, Ulen Bakar, Es Durian/Goyobod)\n• Dekorasi Bunga Asli Megah Vintage Priangan\n• 📸 **Photobox Unlimited 4 Jam + VIP Guestbook Polaroid Album Kayu**\n• Live Music Akustik / Gamelan Degung Sunda Modern\n• Wedding Coordinator & Tim Crew Hari-H (4 Orang)\n\nUntuk simulasi rincian biaya, silakan buka menu tab **"Pernikahan & Event"** di navigasi atas, atau hubungi tim konsultan kami via WhatsApp di **0895-4120-55152**. Wilujeng ngararancang hari bahagia! 💐`;
    } else if (isKidsQuery) {
      // 1. Menu Ramah Anak & Si Kecil (Prioritas Utama agar tidak tertimpa rekomendasi umum pedas/kopi)
      reply = `Sampurasun! Untuk si kecil dan keluarga tercinta, Rumah Tamah Bumi Upi memiliki pilihan menu otentik yang **100% NON-PEDAS, tanpa MSG, higienis, dan sangat disukai anak-anak**:\n\n🍱 **Makanan Utama Favorit Si Kecil:**\n• **Tuangeun Bocil** (Rp 25.000) — Paket komplit ramah anak: nugget ayam mini gurih, sosis goreng, sop bening hangat, dan kentang goreng atau nasi pulen (+Rp 7.000 bisa dapat Es Cokelat).\n• **Mie Anak Sekolah** (Rp 20.000) — Mie goreng lezat bukan mie instan, diolah khusus tanpa MSG dan bebas pedas, aman & bergizi untuk anak.\n• **Dimsum Ekonomis** (Rp 15.000 / 5 pcs) & **Dimsum Sejahtera** (Rp 17.000 / 3 pcs) — Dimsum kukus ayam & udang yang lembut, gurih, dan mudah dikunyah.\n\n🥞 **Camilan Manis & Roti Panggang:**\n• **Pisang Goreng SNI** (Rp 20.000) — Pisang kepok goreng renyah bertabur gula palem alami.\n• **Pisang Bakar Cokelat Keju** (Rp 23.000) & **Pisang Bakar Double Cokelat** (Rp 23.000) — Pisang bakar manis harum lumuran keju parut dan meses cokelat.\n• **Roti Bakar Cokelat** (Rp 20.000) & **Roti Bakar Keju** (Rp 20.000) — Roti empuk tebal resep tempo doeloe.\n• **Ulen Upi** (Rp 22.000) — Ketan bakar gurih kelapa warisan nenek yang legit & lembut.\n\n🥤 **Minuman Segar & Sehat Favorit Anak:**\n• **Es Cokelat Malt Dinosaurus** (Rp 20.000) / **Cokelat Malt Panas** (Rp 20.000) — Cokelat malt kental legit bertabur bubuk melimpah, favorit nomor satu anak-anak!\n• **Jus Stroberi Segar** (Rp 18.000) & **Jus Alpukat Mentega** (Rp 20.000) — Jus buah asli segar manis kaya vitamin C.\n• **Susu Murni Hangat / Dingin** (Rp 15.000) & **Susu Cokelat** (Rp 17.000) — Susu segar murni bergizi.\n\nSemua menu di atas dijamin non-pedas dan aman untuk si kecil. Silakan pilih di katalog menu ya Kak! 🌿`;
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
      reply = `Sampurasun, wilujeng sumping di Rumah Tamah Bumi Upi, ${sapaan}! 🌿\n\nSaya Upi, asisten ramah Anda. Mau pesan menu khas Garut, rekomendasi cemilan hangat, menu ramah si kecil, tanya promo voucher, atau reservasi meja di Bale Utama?`;
    } else if (q.includes('jam') || q.includes('buka') || q.includes('tutup') || q.includes('operasional')) {
      reply = `Rumah Tamah Bumi Upi buka **setiap hari dari pukul 07:00 sampai 23:00 WIB**. Pintu kami selalu terbuka lebar untuk sarapan hangat, santap siang keluarga, hingga nongkrong sore di teras krepyak.`;
    } else if (
      q.includes('lokasi') ||
      q.includes('alamat') ||
      q.includes('dimana') ||
      q.includes('rute') ||
      q.includes('patokan') ||
      (q.includes('garut') && (q.includes('jalan') || q.includes('posisi') || q.includes('daerah') || q.includes('sebelah') || q.includes('kota')))
    ) {
      reply = `Rumah Tamah Bumi Upi beralamat tepat di jantung kota Garut:\n📍 **Jl. Cimanuk No. 312, Pataruman, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat** (Dekat Favehotel Cimanuk & Hotel Tiara, akses sangat mudah di tepi jalan utama dengan area parkir luas).\n\n🏡 **5 Area Nyaman & Estetik di Bumi Upi:**\n1. **Teras Rumah Nenek (Vintage 1930)** — Spot foto pintu viral, jendela krepyak kayu, kursi lipat antik, dan lantai tegel herringbone.\n2. **Ruang Tengah & Ruang Tamu Nenek (Indoor AC)** — Suasana tempo doeloe, radio antik, lemari pajangan nenek, sejuk dan homey.\n3. **Pojok Photobox / Photobooth Vintage** — Spot cetak strip foto retro Rp 25.000 dengan aneka template frame & properti lucu.\n4. **Taman Belakang & Playground (Outdoor Asri)** — Rumput hijau luas, playground anak aman, meja payung di bawah naungan pohon rindang.\n5. **Bale Riung Utama (Pendopo Semi-Outdoor)** — Meja kayu panjang untuk botram keluarga besar, arisan, nobar, hingga venue intimate wedding.\n\nBuka setiap hari pukul 07:00 – 23:00 WIB! 🌿`;
    } else if (
      q.includes('rekomendasi') ||
      q.includes('enak') ||
      q.includes('favorit') ||
      q.includes('menu andalan') ||
      q.includes('best seller') ||
      q.includes('juara')
    ) {
      reply = `Ieu mah menu andalan juara khas Bumi Upi yang paling banyak dirindukan:\n\n🍛 **Makanan Utama:**\n• **Nasi Goreng Kecombrang** (Rp 24.000) — Harum rempah bunga kecombrang asli\n• **Lidah Sambel Hejo** (Rp 47.000) — Empuk gurih disiram sambal hejo segar\n• **Mie Kasep** (Rp 24.000) & **Mie Ebroh** (Rp 25.000)\n• **Ulen Upi** (Rp 22.000) — Ketan bakar gurih kelapa warisan nenek\n\n☕ **Minuman Segar:**\n• **Kopi Hitam** (Rp 17.000/Rp 22.000) & **Kopi Susu Santan** (Rp 23.000)\n• **Es Cincau Jadoel** (Rp 19.000)\n• **Es Cokelat Malt Dinosaurus** (Rp 20.000)\n\nBisa langsung dipilih di menu katalog ya!`;
    } else if (q.includes('bebek') || q.includes('ayam')) {
      reply = `Pilihan olahan unggas andalan kami:\n🍗 **Bebek Sambel Hejo** (Rp 45.000) & **Bebek Goreng Bumi Upi** (Rp 38.000)\n🍗 **Ayam Goreng Lengkuas** (Rp 28.000) — Rempah lengkuas renyah berlimpah\n🍗 **Pepes Ayam Kampung** (Rp 48.000) — Dibalut daun pisang dengan bumbu rempah meresap`;
    } else if (q.includes('kopi') || q.includes('ngopi')) {
      reply = `Untuk pecinta kopi Garut sejati:\n☕ **Kopi Hitam** (Rp 17.000 Medium / Rp 22.000 Large) — Tubruk klasik harum mantap\n☕ **Kopi Susu Santan** (Rp 23.000) — Gurih creamy perpaduan santan & espresso\n☕ **Kopi Susu Gula Aren** (Rp 22.000)\n\nTersedia pilihan dingin (es) maupun panas hangat!`;
    } else if (q.includes('poin') || q.includes('tier') || q.includes('member') || q.includes('loyalitas')) {
      const pts = points !== undefined ? points : 142;
      const tr = tier || 'Sahabat';
      reply = `Status keanggotaan Anda saat ini: **Tier ${tr}** dengan saldo **${pts} Poin Bumi**.\n\nAturan Program Loyalitas:\n• Setiap belanja **Rp 10.000 = 1 Poin**.\n• Tier **Tamu** (0-99 poin) → **Sahabat** (100-299 poin) → **Keluarga** (≥300 poin).\n• Poin dapat dinikmati untuk potongan diskon dan traktiran menu gratis!`;
    } else if (q.includes('voucher') || q.includes('promo') || q.includes('diskon')) {
      reply = `Promo voucher aktif saat ini:\n🎟️ **BUMIWELCOME**: Potongan Rp 15.000 (Min. Rp 50.000)\n🎟️ **PERSIBJUARA**: Diskon 20% cemilan & minuman saat nobar\n🎟️ **ULTAHSUNDA**: Diskon Rp 30.000 spesial traktiran ulang tahun\n\nBisa langsung diklaim saat checkout di keranjang belanja!`;
    } else if (q.includes('nobar') || q.includes('persib') || q.includes('nonton')) {
      reply = `⚽ **Nobar Persib Bandung di Bale Utama Bumi Upi**:\nSetiap pertandingan Persib selalu kami tayangkan di layar proyektor besar. Tersedia voucher diskon 20% dan suasana riuh hangat khas bobotoh Priangan!`;
    } else if (q.includes('reservasi') || q.includes('booking') || q.includes('meja') || q.includes('area') || q.includes('tempat') || q.includes('bale')) {
      reply = `Untuk reservasi meja dan area rombongan di Rumah Tamah Bumi Upi, Kakak bisa langsung memilih meja saat memesan di web atau chat WhatsApp Admin kami di **0895-4120-55152**.\n\nPilihan 5 Area Otentik Bumi Upi Garut:\n• **Teras Rumah Nenek (Vintage 1930)** — Kursi lipat jati, jendela krepyak, spot pintu viral\n• **Ruang Tengah & Ruang Tamu Nenek (Indoor AC)** — Suasana tempo doeloe, sejuk & privat\n• **Pojok Photobox / Photobooth Vintage** — Meja nongkrong santai dekat bilik photobox\n• **Taman Belakang & Playground (Outdoor Asri)** — Leluasa di rumput hijau rindang & ramah anak\n• **Bale Riung Utama (Pendopo Semi-Outdoor)** — Meja kayu panjang untuk botram keluarga besar & acara spesial`;
    } else if (q.includes('harga') || q.includes('berapa')) {
      const match = MENU_ITEMS.find((m) => q.includes(m.name.toLowerCase()));
      if (match) {
        reply = `Harga untuk **${match.name}** adalah **Rp ${match.price.toLocaleString('id-ID')}**. Dibuat dari bahan segar resep turun-temurun!`;
      } else {
        reply = `Katalog menu kami memiliki 105 pilihan otentik mulai dari Rp 10.000 (Es Kelapa) hingga Rp 48.000 (Pepes Ayam Kampung). Silakan cek tab **Katalog Menu** untuk daftar lengkapnya ya!`;
      }
    } else {
      reply = `Hatur nuhun atas pertanyaannya! Apabila Kakak membutuhkan informasi khusus lainnya atau ingin reservasi rombongan besar, tim kami siap melayani lewat WhatsApp Admin di **0895-4120-55152**. Wilujeng tuang di Bumi Upi! 🌿`;
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
