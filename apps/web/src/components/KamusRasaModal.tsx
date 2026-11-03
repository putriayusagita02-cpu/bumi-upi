'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Utensils, ArrowRight } from './icons';

interface KamusEntry {
  id: string;
  name: string;
  sundaneseName: string;
  category: 'Semua' | 'Bumbu & Sambel' | 'Makanan Pokok' | 'Cemilan & Tradisi' | 'Seduhan & Kopi' | 'Minuman & Manisan';
  icon: string;
  filosofi: string;
  caraNikmat: string;
  menuTerkait: string[];
  linkCategory: string;
}

const KAMUS_ENTRIES: KamusEntry[] = [
  {
    id: 'kr-ulen',
    name: 'Ulen Ketan Bakar Arang',
    sundaneseName: 'ᮅᮜᮨᮔ᮪ • Ulen Ketan Garut',
    category: 'Cemilan & Tradisi',
    icon: '🪵',
    filosofi:
      'Simbol kebersamaan (sauyunan) keluarga Sunda. Terbuat dari beras ketan putih pilihan yang ditumbuk halus selagi panas bersama kelapa parut gurih, kemudian dipanggang perlahan di atas bara arang batok kelapa hingga renyah keemasan di luar namun tetap pulen kenyal di dalam.',
    caraNikmat:
      'Paling nikmat dicocol sambel oncom pedas beraroma kencur segar dan dinikmati selagi mengepul hangat bersama secangkir kopi Garut tubruk.',
    menuTerkait: ['Ulen Upi Goreng Arang', 'Ulen Bakar Sambel Oncom'],
    linkCategory: 'Cemilan',
  },
  {
    id: 'kr-cibiuk',
    name: 'Sambel Cibiuk Asli Garut',
    sundaneseName: 'ᮞᮙ᮪ᮘᮨᮜ᮪ ᮎᮤᮘᮤᮅᮊ᮪ • Sambel Hejo Cibiuk',
    category: 'Bumbu & Sambel',
    icon: '🌶️',
    filosofi:
      'Warisan leluhur Desa Cibiuk Garut sejak abad ke-18. Ciri khas autentiknya terletak pada teknik "dibecek" (diulek kasar tidak sampai lumat), memakai cabai rawit hijau, tomat kurus hijau segar, daun surawung (kemangi hutan wangi), dan kencur berkhasiat.',
    caraNikmat:
      'Menjadi pasangan wajib untuk mencocol ikan nila goreng basah, tahu tempe goreng, dan lalapan segar timun terong bulat.',
    menuTerkait: ['Nasi Liwet Sambel Cibiuk', 'Ikan Goreng Sambel Cibiuk'],
    linkCategory: 'Lauk Utama',
  },
  {
    id: 'kr-kecombrang',
    name: 'Kecombrang (Bunga Honje Priangan)',
    sundaneseName: 'ᮠᮧᮔ᮪ᮏᮨ • Bunga Honje Asli',
    category: 'Bumbu & Sambel',
    icon: '🌸',
    filosofi:
      'Bunga honje liar pegunungan Priangan dengan semburat warna merah muda yang anggun. Mengandung minyak atsiri alami dengan aroma citrus eksotis yang mampu membangkitkan selera makan dan menghilangkan aroma amis pada masakan laut maupun unggas.',
    caraNikmat:
      'Diiris tipis dicampurkan ke dalam adonan bala-bala goreng atau disangrai bersama sambel terasi dan suwiran ayam kampung.',
    menuTerkait: ['Ayam Suwir Kecombrang', 'Bala-Bala Gurih Panas'],
    linkCategory: 'Lauk Utama',
  },
  {
    id: 'kr-goyobod',
    name: 'Es Goyobod Tradisional Garut',
    sundaneseName: 'ᮌᮧᮚᮧᮘᮧᮓ᮪ • Es Goyobod Legendaris',
    category: 'Minuman & Manisan',
    icon: '🍧',
    filosofi:
      'Pencuci mulut legendaris Garut yang telah memanjakan lidah sejak 1940-an. Terbuat dari adonan tepung hunkwe kenyal dipotong dadu lembut, dipadukan serutan kelapa muda, alpukat mentega, pacar cina, serta kuah santan kelapa murni berpemanis gula aren asli.',
    caraNikmat:
      'Penutup santapan yang menyejukkan kerongkongan setelah puas menikmati aneka hidangan berkuah pedas dan sambel dadakan.',
    menuTerkait: ['Es Goyobod Garut Segar', 'Es Cincau Jadoel'],
    linkCategory: 'Minuman Tradisional',
  },
  {
    id: 'kr-papandayan',
    name: 'Kopi Lereng Gunung Papandayan',
    sundaneseName: 'ᮊᮧᮕᮤ ᮕᮕᮔ᮪ᮓᮚᮔ᮪ • Arabika Garut',
    category: 'Seduhan & Kopi',
    icon: '☕',
    filosofi:
      'Biji kopi arabika single origin yang dibudidayakan petani lokal di tanah vulkanik berketinggian 1.400 mdpl lereng Gunung Papandayan. Memiliki profil rasa asam buah tropis yang segar (bright acidity), aroma melati lembut, dan aftertaste manis madu hutan.',
    caraNikmat:
      'Diseduh secara tubruk tradisional dengan takaran gilingan medium-coarse dan air mendidih 93°C dalam cangkir blirik enamel hijau khas tempo doeloe.',
    menuTerkait: ['Kopi Hitam Garut', 'Kopi Susu Gula Aren Papandayan'],
    linkCategory: 'Kopi & Teh Tradisional',
  },
  {
    id: 'kr-liwetan',
    name: 'Nasi Liwet Kastrol Daun Salam',
    sundaneseName: 'ᮞᮃᮀᮌᮥ ᮜᮤᮝᮨᮒ᮪ • Liwet Sunda Otentik',
    category: 'Makanan Pokok',
    icon: '🍚',
    filosofi:
      'Jantung tradisi botram warga Jawa Barat. Beras pulen dimasak langsung di atas api arang di dalam kastrol besi bersama serai memar, daun salam kebun, bawang merah utuh berlimpah, dan ikan asin teri peda yang memberikan aroma gurih meresap sampai ke kerak nasi paling bawah.',
    caraNikmat:
      'Dihamparkan di atas daun pisang utuh memanjang, disantap bersama keluarga besar menggunakan tangan kosong (muluk).',
    menuTerkait: ['Nasi Liwet Komplit', 'Paket Botram Liwetan'],
    linkCategory: 'Nasi & Karbohidrat',
  },
  {
    id: 'kr-lidah',
    name: 'Lidah Sapi Sambel Hejo Empuk',
    sundaneseName: 'ᮜᮤᮓᮂ ᮞᮙ᮪ᮘᮨᮜ᮪ ᮠᮦᮏᮧ • Olahan Istimewa',
    category: 'Makanan Pokok',
    icon: '🥩',
    filosofi:
      'Keahlian olah rempah dapur nenek yang dimasak perlahan berjam-jam (slow cooked) dengan daun salam, lengkuas, dan asam kandis hingga serat lidah empuk lumer di mulut, lalu disiram sambel hejo melimpah yang tidak menyengat di tenggorokan.',
    caraNikmat:
      'Disajikan bersama nasi putih pulen panas dan sejumput perkedel kentang garut.',
    menuTerkait: ['Lidah Sambel Hejo', 'Nasi Goreng Lidah Cabe Ijo'],
    linkCategory: 'Lauk Utama',
  },
  {
    id: 'kr-birkotjok',
    name: 'Bir Kotjok & Bajigur Rempah',
    sundaneseName: 'ᮘᮤᮛ᮪ ᮊᮧᮒ᮪ᮏᮧᮊ᮪ • Jamu Rempah Priangan',
    category: 'Seduhan & Kopi',
    icon: '🍵',
    filosofi:
      'Minuman rempah 100% non-alkohol warisan tanah Sunda untuk menghangatkan badan di malam hari yang berkabut dingin. Diracik dari jahe merah bakar, kayu manis, cengkeh, dan gula aren murni yang dikocok hingga menghasilkan buih lembut aromatik.',
    caraNikmat:
      'Diteguk perlahan sambil menikmati cemilan pisang goreng keju atau ulen bakar di saung lesehan.',
    menuTerkait: ['Bir Kotjok Hangat', 'Bajigur Santan Kelapa'],
    linkCategory: 'Minuman Tradisional',
  },
];

interface KamusRasaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KamusRasaModal: React.FC<KamusRasaModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEntry, setActiveEntry] = useState<KamusEntry | null>(null);

  if (!isOpen) return null;

  const categories = [
    'Semua',
    'Bumbu & Sambel',
    'Makanan Pokok',
    'Cemilan & Tradisi',
    'Seduhan & Kopi',
    'Minuman & Manisan',
  ];

  const filteredEntries = KAMUS_ENTRIES.filter((entry) => {
    if (selectedCategory !== 'Semua' && entry.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entry.name.toLowerCase().includes(q);
      const matchFilosofi = entry.filosofi.toLowerCase().includes(q);
      const matchSundanese = entry.sundaneseName.toLowerCase().includes(q);
      if (!matchName && !matchFilosofi && !matchSundanese) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#2B2625]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-[2.5rem] bg-[#FBF7EE] border-2 border-[#D4A24C] shadow-2xl p-5 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DCC2]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4EADF] text-[#3E4F30] text-[10px] font-bold uppercase tracking-wider">
              <span>🌿</span>
              <span>Ensiklopedi Kuliner Priangan</span>
            </div>
            <h2
              className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Kamus Rasa & Filosofi Masakan Nenek
            </h2>
            <p className="text-xs text-[#634E3F]">
              Kisah di balik bahan-bahan khas, tradisi botram, dan rahasia rasa dapur Rumah Tamah Bumi Upi Garut.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E8DCC2]/60 hover:bg-[#E8DCC2] text-[#634E3F] flex items-center justify-center text-sm font-bold transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7767]" />
            <input
              type="text"
              placeholder="Cari filosofi ulen, sambel cibiuk, kecombrang, kopi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7767] hover:text-[#2B2625]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Pill bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
                      : 'bg-white border border-[#E8DCC2] text-[#634E3F] hover:bg-[#F5EEDC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entries Grid or Detail Modal */}
        {activeEntry ? (
          /* Active Single Entry Detail View */
          <div className="p-6 rounded-3xl bg-white border-2 border-[#D4A24C] shadow-md space-y-4">
            <div className="flex items-start justify-between border-b border-[#E8DCC2] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 rounded-2xl bg-[#F5EEDC] border border-[#E0D4BA]">
                  {activeEntry.icon}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-[#B4532A] uppercase tracking-wider">
                    {activeEntry.category}
                  </span>
                  <h3
                    className="font-serif text-xl sm:text-2xl font-bold text-[#2B2625]"
                    style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                  >
                    {activeEntry.name}
                  </h3>
                  <span className="text-xs font-serif text-[#3E4F30] font-bold">
                    {activeEntry.sundaneseName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveEntry(null)}
                className="text-xs font-bold text-[#B4532A] hover:underline"
              >
                ← Kembali ke Daftar
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3E4F30] block">
                Filosofi & Kisah Leluhur:
              </span>
              <p className="text-xs sm:text-sm text-[#4A3E38] leading-relaxed">
                {activeEntry.filosofi}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8DCC2] space-y-1">
              <span className="text-[10px] font-bold text-[#B4532A] uppercase tracking-wider block">
                🍽️ Petunjuk Rasa Terbaik (Cara Nikmat):
              </span>
              <p className="text-xs text-[#2B2625] italic leading-relaxed">
                {activeEntry.caraNikmat}
              </p>
            </div>

            {/* Related Menu Items in Catalog */}
            <div className="pt-2 border-t border-[#E8DCC2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#8C7767] uppercase block font-semibold">
                  Tersedia di Menu Bumi Upi:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeEntry.menuTerkait.map((menu, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4EADF] text-[#3E4F30] font-bold"
                    >
                      ✓ {menu}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/menu`}
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Pesan di Buku Menu →</span>
              </Link>
            </div>
          </div>
        ) : (
          /* List of Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[52vh] overflow-y-auto pr-1">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setActiveEntry(entry)}
                className="p-4 rounded-2xl bg-white border border-[#E8DCC2] hover:border-[#3E4F30] shadow-2xs hover:shadow-md cursor-pointer transition space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{entry.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EEDC] text-[#8C7767]">
                      {entry.category}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#2B2625]">
                    {entry.name}
                  </h4>
                  <span className="text-[10px] text-[#3E4F30] font-bold block">
                    {entry.sundaneseName}
                  </span>
                  <p className="text-xs text-[#634E3F] line-clamp-2 leading-relaxed">
                    {entry.filosofi}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8DCC2]/60 flex items-center justify-between text-[11px] text-[#B4532A] font-bold">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-[#E8DCC2] flex items-center justify-between text-xs text-[#634E3F]">
          <span>
            Bumi Upi • Menjaga warisan kuliner Priangan Timur tetap lestari.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3E4F30] text-[#F5EEDC] font-bold hover:brightness-110"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
