'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface WeddingPackage {
  id: string;
  name: string;
  tagline: string;
  pax: number;
  price: number;
  isPopular?: boolean;
  features: string[];
  photoboxFeature: string;
  cateringHighlights: string[];
}

const PACKAGES: WeddingPackage[] = [
  {
    id: 'pkg-akad',
    name: 'Paket Akad & Syukuran Intimate',
    tagline: 'Sakral, hangat, & khidmat bersama keluarga dan kerabat inti',
    pax: 50,
    price: 14500000,
    features: [
      'Venue Eksklusif 4 Jam (Teras Depan & Ruang Tengah Indoor)',
      'Meja Ijab Qabul & Dekorasi Akad Minimalis Rustic Modern',
      'Kursi Tiffany & Meja Tamu Keluarga Inti (50 Kursi)',
      'Sound System Standard 2.000W & 2 Mic Wireless',
      'Ruang Rias Pengantin Berpendingin (AC)',
      'Listrik Standar & Kebersihan Acara'
    ],
    photoboxFeature: '📸 Photobox Vintage Unlimited 2 Jam dengan Frame Custom Nama Pengantin',
    cateringHighlights: [
      'Buffet Prasmanan 50 Pax Dapur Nenek Garut',
      'Menu: Nasi Liwet Kastrol, Pepes Ayam Kampung, Tahu & Tempe Bacem',
      'Sayur Lodeh Labu Siam & Lalapan Sambal Hejo',
      'Minuman: Es Cincau Jadoel & Teh Manis Hangat'
    ]
  },
  {
    id: 'pkg-garden',
    name: 'Paket Intimate Garden & Heritage',
    tagline: 'Pilihan paling favorit: Perpaduan rumah antik tempo doeloe & taman hijau asri',
    pax: 100,
    price: 28500000,
    isPopular: true,
    features: [
      'Full Venue Eksklusif 6 Jam (Indoor Vintage + Taman Belakang + Bale Riung)',
      'Dekorasi Pelaminan Rustic Sunda Heritage berlatar Pintu Kayu Klasik Viral',
      'Dekorasi Lorong Masuk / Welcome Gate Bunga Kering & Bambu Alami',
      '100 Kursi Lipat Antik & Meja Payung Taman',
      'Alunan Musik Tradisional Kecapi Suling Sunda / Live Acoustic',
      'Sound System Profesional 3.500W & Soundman',
      'MC Akad & Resepsi Berpengalaman',
      'Ruang Transit Keluarga & Ruang Rias Pengantin AC',
      'Area Bermain (Playground) Terbuka untuk Anak Tamu Undangan'
    ],
    photoboxFeature: '📸 Photobox Vintage Unlimited 3 Jam + Properti Lucu Retro + Softcopy Google Drive',
    cateringHighlights: [
      'Buffet Prasmanan 100 Pax Menu Juara Priangan',
      'Menu Utama: Nasi Liwet Gurih, Lidah Sambel Hejo, Ayam Kalasan Rempah',
      'Karedok Sayur Segar, Sop Bening Iga Rempah',
      '2 Food Stall Spesial: Gorengan Darmaji (100 porsi) & Es Cendol Tradisional (100 porsi)',
      'Wedang Jahe Sereh Hangat & Infused Water Segar'
    ]
  },
  {
    id: 'pkg-riung',
    name: 'Paket Pesta Riung Istimewa',
    tagline: 'Perayaan akbar istimewa berkesan mewah bernuansa pusaka Priangan',
    pax: 200,
    price: 48000000,
    features: [
      'Full Venue Eksklusif Seharian Penuh (8 Jam Acara)',
      'Dekorasi Bunga Asli Megah Full Area (Indoor, Teras, Gazebo Taman & Bale Riung)',
      'Panggung Pelaminan Mewah dengan Ornamen Jati Klasik & Lighting Hangat',
      '200 Kursi Tamu Elegan & Meja Prasmanan VIP Keluarga',
      'Live Music Full Band Akustik / Gamelan Degung Sunda Modern',
      'Sound System Concert 5.000W & Lighting Ambience Romantis',
      'Master of Ceremony (MC) Bilingual & Rundown Acara Terpadu',
      'Wedding Coordinator (4 Orang Crew Hari-H Standby Penuh)',
      'Ruang Rias VIP Pengantin + Kamar Istirahat Keluarga',
      'Slot Foto Prewedding Eksklusif Bebas di Seluruh Sudut Bumi Upi'
    ],
    photoboxFeature: '📸 Photobox Unlimited 4 Jam + VIP Guestbook Polaroid Kayu Jati + Custom Wooden Flashdisk',
    cateringHighlights: [
      'Buffet Prasmanan 200 Pax Menu Istimewa Dapur Nenek Garut',
      'Menu: Nasi Liwet Kastrol, Lidah Sambel Hejo, Bebek Sambel Hejo, Buntut Goreng',
      '4 Food Stall Lengkap: Kambing Guling (2 Ekor), Mie Racing Garut (150 porsi), Ulen Bakar Nenek (150 porsi), & Es Durian Montong (150 porsi)',
      'Aneka Jus Segar, Kopi Tubruk Garut, & Wedang Herbal'
    ]
  }
];

const ADDONS = [
  { id: 'add-photobox-ext', name: 'Extra Jam Photobox Unlimited (+1 Jam)', price: 1500000, icon: '📸' },
  { id: 'add-kecapi', name: 'Live Musisi Kecapi Suling Sunda Melodius (3 Jam)', price: 1800000, icon: '🎶' },
  { id: 'add-kambing', name: 'Food Stall Kambing Guling Rempah (1 Ekor ~ 50 Porsi)', price: 2500000, icon: '🍖' },
  { id: 'add-barista', name: 'Barista Kopi Bar Corner Khas Garut (100 Cup)', price: 1500000, icon: '☕' },
  { id: 'add-prewed', name: 'Sesi Pemotretan Prewedding Full Area (4 Jam)', price: 1200000, icon: '📷' },
  { id: 'add-hantaran', name: 'Paket Hias Kotak Hantaran & Seserahan Rustic (8 Kotak)', price: 800000, icon: '🎁' }
];

export default function WeddingPlanPage() {
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-garden');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['add-photobox-ext']);
  const [activeTab, setActiveTab] = useState<'pricelist' | 'photobooth' | 'calculator' | 'venues'>('pricelist');

  const currentPkg = PACKAGES.find((p) => p.id === selectedPkgId) || PACKAGES[1];

  // Hitung biaya estimasi kalkulator
  const basePrice = currentPkg.price;
  const extraGuests = Math.max(0, guestCount - currentPkg.pax);
  const extraGuestCost = extraGuests * 110000; // Rp 110.000 per pax ekstra makan
  const addonsCost = selectedAddons.reduce((sum, addId) => {
    const item = ADDONS.find((a) => a.id === addId);
    return sum + (item ? item.price : 0);
  }, 0);

  const grandTotal = basePrice + extraGuestCost + addonsCost;
  const costPerGuest = Math.round(grandTotal / guestCount);

  const toggleAddon = (addId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addId) ? prev.filter((id) => id !== addId) : [...prev, addId]
    );
  };

  const getWaLink = () => {
    const addonsListText = selectedAddons
      .map((id) => ADDONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `Sampurasun Admin Bumi Upi Garut! 🌿\n\nSaya ingin konsultasi tanggal & reservasi Wedding / Event di Bumi Upi:\n• Pilihan Paket: ${currentPkg.name}\n• Rencana Jumlah Tamu: ${guestCount} Orang\n• Pilihan Add-ons: ${addonsListText || 'Belum ada'}\n• Estimasi Biaya Simulasi: Rp ${grandTotal.toLocaleString('id-ID')}\n\nMohon informasi ketersediaan tanggal dan jadwal survei lokasi / food tasting ya Kak. Hatur nuhun!`;

    return `https://wa.me/6281223344550?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. HERO HEADER */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#2B3A21] via-[#3E4F30] to-[#1F2B17] text-[#F5EEDC] p-6 sm:p-10 border-2 border-[#D4A24C]/60 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4A24C]/20 border border-[#D4A24C]/50 text-[#D4A24C] text-xs font-bold uppercase tracking-wider">
            <span>💍</span>
            <span>Intimate Wedding & Event Venue Garut</span>
          </div>

          <h1
            className="font-serif text-3xl sm:text-5xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Rencana Pernikahan Impian di Rumah Tamah Bumi Upi
          </h1>

          <p className="text-sm sm:text-base text-[#E0D4BA] leading-relaxed">
            Menikah dengan suasana hangat tempo doeloe ala rumah nenek di Jl. Cimanuk 312 Garut.
            Perpaduan teras krepyak kayu jati klasik 1930, halaman rumput hijau teduh, jamuan prasmanan otentik Dapur Nenek, dan fasilitas <strong>Photobox Vintage</strong> instan untuk seluruh tamu undangan!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 font-semibold flex items-center gap-1.5">
              <span>🏡</span>
              <span>Kapasitas 50 – 300 Tamu</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 font-semibold flex items-center gap-1.5">
              <span>📸</span>
              <span>Photobox Vintage Unlimited</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 font-semibold flex items-center gap-1.5">
              <span>🍲</span>
              <span>Katering Otentik Sunda Garut</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 font-semibold flex items-center gap-1.5">
              <span>📍</span>
              <span>Pusat Kota Garut (Parkir Luas)</span>
            </span>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <a
              href={getWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-xl bg-[#D4A24C] hover:bg-[#c2913e] text-[#2B2625] font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <span>💬 Jadwalkan Survei & Konsultasi WA</span>
            </a>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className="py-3 px-5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm transition active:scale-95"
            >
              <span>🧮 Hitung Biaya Simulasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E8DCC2] pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('pricelist')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pricelist'
              ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
              : 'bg-[#FBF7EE] text-[#634E3F] hover:bg-white'
          }`}
        >
          <span>📋</span>
          <span>Pricelist Paket Pernikahan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photobooth')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'photobooth'
              ? 'bg-[#B4532A] text-white shadow-xs'
              : 'bg-[#FBF7EE] text-[#634E3F] hover:bg-white'
          }`}
        >
          <span>📸</span>
          <span>Pojok Photobox Bumi Upi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-[#D4A24C] text-[#2B2625] shadow-xs'
              : 'bg-[#FBF7EE] text-[#634E3F] hover:bg-white'
          }`}
        >
          <span>🧮</span>
          <span>Kalkulator Estimasi Biaya</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('venues')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'venues'
              ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
              : 'bg-[#FBF7EE] text-[#634E3F] hover:bg-white'
          }`}
        >
          <span>🏡</span>
          <span>5 Area Venue Otentik</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {/* TAB A: PRICELIST PAKET PERNIKAHAN */}
      {activeTab === 'pricelist' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2
              className="font-serif text-2xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Pilihan Paket Intimate Wedding
            </h2>
            <p className="text-xs text-[#634E3F]">
              Semua paket sudah mencakup sewa tempat privat, katering prasmanan lezat, dekorasi pelaminan rustic, dan fasilitas Photobox kenangan untuk tamu!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`flex flex-col justify-between p-6 rounded-3xl transition-all duration-300 relative ${
                    pkg.isPopular
                      ? 'bg-gradient-to-b from-[#FDFBF7] to-[#F5EEDC] border-2 border-[#D4A24C] shadow-xl scale-[1.02]'
                      : 'bg-[#FBF7EE] border border-[#E8DCC2] shadow-sm hover:shadow-md'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#B4532A] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      ⭐ Rekomendasi Terfavorit
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3
                        className="font-serif text-lg font-bold text-[#2B2625]"
                        style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                      >
                        {pkg.name}
                      </h3>
                      <p className="text-[11px] text-[#634E3F] mt-1">{pkg.tagline}</p>
                    </div>

                    <div className="p-3 bg-white/80 rounded-2xl border border-[#E8DCC2]/80 space-y-1">
                      <span className="text-[10px] text-[#634E3F] block uppercase tracking-wider font-semibold">
                        Kapasitas & Investasi:
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-[#3E4F30]">
                          Rp {(pkg.price / 1000000).toFixed(1)} Jt
                        </span>
                        <span className="text-xs text-[#8C7767]">/ {pkg.pax} Tamu</span>
                      </div>
                      <span className="text-[10px] text-[#B4532A] font-bold block">
                        ≈ Rp {Math.round(pkg.price / pkg.pax).toLocaleString('id-ID')} / Tamu
                      </span>
                    </div>

                    {/* Photobox Badge */}
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 leading-snug">
                      {pkg.photoboxFeature}
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[#2B2625] uppercase tracking-wider block">
                        Fasilitas Venue & Dekorasi:
                      </span>
                      <ul className="text-xs text-[#634E3F] space-y-1.5">
                        {pkg.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#3E4F30] font-bold">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Catering Preview */}
                    <div className="space-y-2 pt-2 border-t border-[#E8DCC2]">
                      <span className="text-[11px] font-bold text-[#2B2625] uppercase tracking-wider block">
                        Jamuan Katering Dapur Nenek:
                      </span>
                      <ul className="text-xs text-[#634E3F] space-y-1">
                        {pkg.cateringHighlights.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#B4532A] font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPkgId(pkg.id);
                        setGuestCount(pkg.pax);
                        setActiveTab('calculator');
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#3E4F30] hover:bg-[#2F3D24] text-[#F5EEDC] text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Pilih & Simulasikan Paket →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: POJOK PHOTOBOX / PHOTOBOOTH VINTAGE */}
      {activeTab === 'photobooth' && (
        <div className="space-y-6 bg-[#FBF7EE] p-6 sm:p-8 rounded-3xl border border-[#E8DCC2] shadow-sm animate-fade-in">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B4532A]">
              📸 Spot Foto Ikonik Bumi Upi
            </span>
            <h2
              className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Photobox Vintage & Kenangan Abadi di Bumi Upi
            </h2>
            <p className="text-xs sm:text-sm text-[#634E3F] leading-relaxed">
              Di Rumah Tamah Bumi Upi, setiap tawa dan pelukan tak akan luntur oleh waktu. Kami menyediakan fasilitas <strong>Photobox Vintage</strong> yang viral dengan cetakan foto fisik bertekstur klasik retro ala foto studio zaman dulu!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Service 1: Pengunjung Harian */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DCC2] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                🎟️
              </div>
              <h3 className="font-bold text-sm text-[#2B2625]">
                Photobox Harian Pengunjung (Self-Service)
              </h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Bagi pengunjung restoran yang sedang nongkrong, ngopi, atau santap keluarga, bilik photobox kami siap digunakan kapan saja:
              </p>
              <ul className="text-xs text-[#634E3F] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#3E4F30]">✓</span>
                  <span><strong>Tarif:</strong> Rp 25.000 (Dapat 2 Strip Foto Cetak Fisik)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#3E4F30]">✓</span>
                  <span><strong>Template Frame:</strong> Retro Vintage, Floral Priangan, Bumi Upi 1930</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#3E4F30]">✓</span>
                  <span><strong>Properti Bebas Pakai:</strong> Kacamata jadul, topi fedora, bando lucu</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#3E4F30]">✓</span>
                  <span><strong>Softcopy Instan:</strong> Scan QR langsung masuk ke galeri HP</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Paket Event & Wedding */}
            <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5EEDC] p-5 rounded-2xl border-2 border-[#D4A24C] shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#B4532A]/20 text-[#B4532A] flex items-center justify-center text-xl">
                💍
              </div>
              <h3 className="font-bold text-sm text-[#2B2625]">
                Paket Sewa Photobooth untuk Acara & Pernikahan
              </h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Jadikan pernikahan atau syukuran Anda semakin meriah dengan photobooth unlimited yang dicetak langsung untuk para tamu undangan:
              </p>
              <ul className="text-xs text-[#634E3F] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#B4532A]">★</span>
                  <span><strong>Unlimited Print:</strong> Tamu bebas berfoto dan mencetak sepuasnya</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#B4532A]">★</span>
                  <span><strong>Custom Header:</strong> Nama kedua mempelai, tanggal & ornamen rustic</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#B4532A]">★</span>
                  <span><strong>Operator Khusus:</strong> 2 Orang crew memandu tamu berpose & cetak</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#B4532A]">★</span>
                  <span><strong>Guestbook Polaroid:</strong> Tamu bisa menempelkan strip foto & ucapan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: KALKULATOR ESTIMASI BIAYA */}
      {activeTab === 'calculator' && (
        <div className="bg-[#FBF7EE] p-6 sm:p-8 rounded-3xl border border-[#E8DCC2] shadow-sm space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3E4F30]">
              🧮 Simulasi Fleksibel
            </span>
            <h2
              className="font-serif text-2xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Kalkulator Rencana Biaya Pernikahan
            </h2>
            <p className="text-xs text-[#634E3F]">
              Sesuaikan jumlah tamu dan fasilitas tambahan untuk mendapatkan gambaran estimasi anggaran pernikahan Anda secara transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Pilih Paket */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2B2625] uppercase tracking-wider block">
                  1. Pilih Paket Utama:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSelectedPkgId(pkg.id);
                        if (guestCount < pkg.pax) setGuestCount(pkg.pax);
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        selectedPkgId === pkg.id
                          ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
                          : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:bg-[#F5EEDC]'
                      }`}
                    >
                      <div className="font-bold text-xs">{pkg.name}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        Rp {(pkg.price / 1000000).toFixed(1)} Jt ({pkg.pax} Pax)
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Jumlah Tamu Slider */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E8DCC2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2B2625] uppercase tracking-wider">
                    2. Estimasi Jumlah Tamu Undangan:
                  </label>
                  <span className="font-mono text-base font-extrabold text-[#3E4F30]">
                    {guestCount} Orang
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-full accent-[#3E4F30] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8C7767]">
                  <span>50 Tamu (Intimate)</span>
                  <span>100 Tamu (Standar)</span>
                  <span>200 Tamu</span>
                  <span>300 Tamu (Maksimal)</span>
                </div>
                {extraGuests > 0 && (
                  <p className="text-[11px] text-[#B4532A] font-semibold mt-1">
                    * Tambahan {extraGuests} tamu di atas kuota paket (+Rp {(extraGuestCost).toLocaleString('id-ID')} untuk porsi prasmanan ekstra).
                  </p>
                )}
              </div>

              {/* 3. Pilihan Fasilitas Tambahan (Add-ons) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2B2625] uppercase tracking-wider block">
                  3. Pilihan Tambahan (Add-ons):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                          isChecked
                            ? 'border-[#B4532A] bg-[#B4532A]/10 text-[#2B2625]'
                            : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
                        }`}
                      >
                        <span className="text-xl select-none">{addon.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold leading-tight">{addon.name}</div>
                          <div className="text-[11px] font-mono text-[#3E4F30] font-semibold mt-0.5">
                            +Rp {addon.price.toLocaleString('id-ID')}
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${isChecked ? 'text-[#B4532A]' : 'text-gray-300'}`}>
                          {isChecked ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Total Summary Card */}
            <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5EEDC] p-6 rounded-3xl border-2 border-[#D4A24C] shadow-lg flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-[#B4532A] uppercase tracking-wider block">
                  Ringkasan Estimasi Biaya
                </span>

                <div className="space-y-2 text-xs border-b border-[#E8DCC2] pb-4">
                  <div className="flex justify-between text-[#634E3F]">
                    <span>{currentPkg.name}:</span>
                    <span className="font-mono font-bold text-[#2B2625]">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {extraGuests > 0 && (
                    <div className="flex justify-between text-[#634E3F]">
                      <span>Ekstra {extraGuests} Pax Makanan:</span>
                      <span className="font-mono font-bold text-[#2B2625]">
                        Rp {extraGuestCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {addonsCost > 0 && (
                    <div className="flex justify-between text-[#634E3F]">
                      <span>Add-ons ({selectedAddons.length} Item):</span>
                      <span className="font-mono font-bold text-[#2B2625]">
                        Rp {addonsCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#634E3F] block">Total Estimasi Anggaran:</span>
                  <div className="font-serif text-3xl font-black text-[#3E4F30]">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-[#B4532A] font-semibold block">
                    ≈ Rp {costPerGuest.toLocaleString('id-ID')} per tamu undangan
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={getWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#3E4F30] hover:bg-[#2F3D24] text-[#F5EEDC] text-xs font-bold text-center transition shadow-md block active:scale-95"
                >
                  💬 Kunci Tanggal & Tanya Admin WA
                </a>
                <p className="text-[10px] text-center text-[#8C7767]">
                  * Jadwal survei lokasi dan food tasting gratis setelah konfirmasi awal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: 5 AREA VENUE OTENTIK BUMI UPI */}
      {activeTab === 'venues' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2
              className="font-serif text-2xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              5 Area Nyaman & Estetik di Bumi Upi
            </h2>
            <p className="text-xs text-[#634E3F]">
              Setiap sudut dirancang dengan filosofi kehangatan rumah nenek dan keindahan Garut tempo doeloe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#E8DCC2] space-y-2">
              <span className="text-2xl">🪑</span>
              <h3 className="font-bold text-sm text-[#2B2625]">1. Teras Rumah Nenek (Vintage 1930)</h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Spot foto ikonik pintu kayu klasik viral, kusen krepyak hijau kolonial, kursi lipat tempo doeloe, dan lantai bata merah herringbone yang sejuk menyambut tamu.
              </p>
            </div>

            <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#E8DCC2] space-y-2">
              <span className="text-2xl">📻</span>
              <h3 className="font-bold text-sm text-[#2B2625]">2. Ruang Tengah & Ruang Tamu Nenek</h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Area indoor sejuk ber-AC dengan sofa empuk keluarga, pajangan radio tabung jadul, lemari kristal kuno nenek, dan suasana intim untuk akad nikah atau kumpul keluarga.
              </p>
            </div>

            <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#E8DCC2] space-y-2">
              <span className="text-2xl">📸</span>
              <h3 className="font-bold text-sm text-[#2B2625]">3. Pojok Photobox & Sudut Nostalgia</h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Area photobooth retro di mana para tamu bisa berpose bebas dengan aneka properti unik dan langsung membawa pulang strip foto fisik bertuliskan nama pengantin.
              </p>
            </div>

            <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#E8DCC2] space-y-2">
              <span className="text-2xl">🌿</span>
              <h3 className="font-bold text-sm text-[#2B2625]">4. Taman Belakang & Playground</h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Halaman rumput hijau alami yang luas di bawah naungan pohon rindang, dilengkapi fasilitas playground ramah anak sehingga seluruh keluarga merasa betah.
              </p>
            </div>

            <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#E8DCC2] space-y-2">
              <span className="text-2xl">🏮</span>
              <h3 className="font-bold text-sm text-[#2B2625]">5. Bale Riung Utama (Pendopo Semi-Outdoor)</h3>
              <p className="text-xs text-[#634E3F] leading-relaxed">
                Pendopo lapang dengan meja kayu panjang jati solid, cocok untuk panggung pelaminan, alunan kecapi suling, dan jamuan prasmanan botram akbar.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#3E4F30] to-[#2B3A21] text-[#F5EEDC] p-5 rounded-2xl border border-[#D4A24C]/60 flex flex-col justify-between">
              <div>
                <span className="text-2xl">📍</span>
                <h3 className="font-bold text-sm text-white mt-1">Lokasi Sangat Strategis</h3>
                <p className="text-xs text-[#E0D4BA] leading-relaxed mt-1">
                  Jl. Cimanuk No. 312, Pataruman, Tarogong Kidul, Garut. Dekat Favehotel dan hotel utama, mudah diakses kendaraan roda empat & bus rombongan.
                </p>
              </div>
              <a
                href="https://wa.me/6281223344550?text=Halo%20Admin%20Bumi%20Upi,%20saya%20ingin%20jadwalkan%20survei%20lokasi%20venue%20wedding"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 py-2 px-3 rounded-xl bg-[#D4A24C] text-[#2B2625] text-xs font-bold text-center hover:bg-white transition"
              >
                Jadwalkan Kunjungan Survei →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
