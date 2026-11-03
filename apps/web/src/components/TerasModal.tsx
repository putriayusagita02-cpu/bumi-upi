'use client';

import React from 'react';
import Link from 'next/link';

interface TerasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerasModal: React.FC<TerasModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const terraceHighlights = [
    {
      icon: '🪵',
      title: 'Plang Kayu Jati "✤ bumi upi ✤"',
      desc: 'Papan kayu jati solid dengan grafir tipografi bulat khas tempo doeloe dan ornamen bunga semanggi putih yang melambangkan berkah ketentraman.'
    },
    {
      icon: '📍',
      title: 'Nomor 312 Jl. Cimanuk',
      desc: 'Angka 312 timbul di dinding putih bertekstur, penanda rumah tamah yang berdiri ramah di kawasan legendaris Tarogong Kidul, Garut.'
    },
    {
      icon: '🚲',
      title: 'Sepeda Onthel Klasik',
      desc: 'Sepeda kumbang tua peninggalan masa lampau dengan sadel kulit asli, terparkir teduh di dekat deretan tanaman monstera dan anggrek gantung.'
    },
    {
      icon: '🪑',
      title: 'Kursi Lipat Teras & Meja Peti Kayu',
      desc: 'Sepasang kursi lipat anyam putih bergaris jingga hangat ditemani meja peti kayu vintage, sudut favorit untuk menikmati secangkir kopi tubruk lereng Papandayan.'
    },
    {
      icon: '🌿',
      title: 'Kusen Hijau Kolonial & Tegel Priangan',
      desc: 'Pintu dan jendela krepyak kayu berwarna hijau tua hutan dipadu lis ubin tegel bermotif bunga klasik di sepanjang dinding bawah teras.'
    },
    {
      icon: '🧱',
      title: 'Lantai Bata Merah Herringbone',
      desc: 'Hamparan terakota merah bermotif sirip ikan yang sejuk, menyerap hawa sejuk khas Priangan Timur dan menyambut tiap tamu yang bertandang.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FBF7EE] rounded-3xl border-2 border-[#D4A24C] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-[#2B2625]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-[#3E4F30] to-[#2B3A21] text-[#F5EEDC] border-b border-[#D4A24C]/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#D4A24C]/30 text-[#F5EEDC]">
              <span>🏡</span>
            </div>
            <div>
              <h3
                className="font-serif text-base sm:text-lg font-bold leading-tight"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Teras Rumah Tamah Bumi Upi
              </h3>
              <p className="text-[11px] text-[#E0D4BA]">
                Jl. Cimanuk No. 312, Tarogong Kidul, Garut, Jawa Barat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-[#F5EEDC] flex items-center justify-center transition-colors text-sm font-bold"
            aria-label="Tutup Modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Foto Asli dengan Efek Frame Vintage */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4A24C]/50 shadow-md bg-black">
            <img
              src="/brand/bumi-upi-teras.jpg"
              alt="Fasad Rumah Tamah Bumi Upi Garut - Jl. Cimanuk 312"
              className="w-full h-auto max-h-80 object-cover object-center"
            />
            {/* Plang Teak Wood Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E4F30]/90 backdrop-blur-xs text-white text-[11px] font-bold shadow border border-[#D4A24C]/40">
              <span>📍</span>
              <span>Jl. Cimanuk 312, Garut</span>
            </div>
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#B4532A]/90 backdrop-blur-xs text-white text-[11px] font-bold shadow">
              ✤ bumi upi ✤
            </div>
          </div>

          {/* Kisah Sudut Teras */}
          <div className="space-y-2">
            <h4
              className="font-serif text-sm sm:text-base font-bold text-[#3E4F30]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Pesona Teras Rumah Tamah Tempo Doeloe
            </h4>
            <p className="text-xs text-[#634E3F] leading-relaxed font-sans">
              Setiap sudut di teras Bumi Upi dirancang untuk menghidupkan kembali nostalgia rumah nenek di Priangan. Mulai dari plang kayu jati berukir, sepeda onthel klasik, hingga sepasang kursi lipat anyam di atas lantai bata merah herringbone, semuanya menyambut kedatangan Anda dengan kehangatan khas Garut.
            </p>
          </div>

          {/* Grid 6 Ornamen Heritage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {terraceHighlights.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-[#E8DCC2] shadow-2xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <h5 className="font-serif text-xs font-bold text-[#2B2625]">
                    {item.title}
                  </h5>
                </div>
                <p className="text-[11px] text-[#634E3F] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F5EEDC] border-t border-[#E8DCC2] flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-xs text-[#3E4F30] italic font-serif hidden sm:block"
            style={{ fontFamily: 'var(--font-caveat, "Caveat", cursive)' }}
          >
            &quot;Wilujeng sumping, mangga calik heula di teras.&quot;
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/auth?mode=register"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 shadow-xs flex items-center gap-1.5"
            >
              <span>🏡</span>
              <span>Mari Bertamu Sekarang</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-[#D5C7B0] bg-white text-xs font-bold text-[#2B2625] hover:bg-[#F5EEDC]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
