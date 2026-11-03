'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Check, ArrowRight } from './icons';

interface SuratRindu {
  id: string;
  name: string;
  origin: string;
  category: string;
  message: string;
  date: string;
  nenekBlessing: string;
  likes: number;
}

const PRESEEDED_SURAT: SuratRindu[] = [
  {
    id: 'sr-1',
    name: 'Teh Sarah Nurhaliza',
    origin: 'Bandung',
    category: 'Cucu yang Merantau',
    message:
      'Tiap kali makan sambel cibiuk sama ulen bakar di sini, langsung nangis inget masakan emak di Wanaraja. Bener-bener obat rindu kampung halaman...',
    date: '2 Nopember 2026',
    nenekBlessing:
      'Hatur nuhun Geulis Sarah. Sing sarehat di panyabaan, sing jembar rezekina. Upi salawasna ngadungakeun ti Garut.',
    likes: 42,
  },
  {
    id: 'sr-2',
    name: 'Kang Dian Prasetya',
    origin: 'Jakarta Selatan',
    category: 'Penikmat Masakan Tradisional',
    message:
      'Rela macet-macetan dari tol Cipularang tiap akhir pekan cuma buat nyeduh kopi Papandayan dan duduk di saung lesehan kolam koi. Suasananya menenangkan jiwa.',
    date: '1 Nopember 2026',
    nenekBlessing:
      'Sing salamet di jalanna Kasep Dian. Dapur arang nenek salawasna ngebul haneut nganti anaking mulih.',
    likes: 38,
  },
  {
    id: 'sr-3',
    name: 'Ibu Ratna & Keluarga',
    origin: 'Bekasi Barat',
    category: 'Kenangan Masa Kecil',
    message:
      'Porsi liwetannya melimpah ruah, anak-anak saya lahap banget sama ayam basah dan perkedel kentang. Persis rasa masakan nenek buyutnya dulu.',
    date: '31 Oktober 2026',
    nenekBlessing:
      'Mugia barokah kersaning Gusti, sing rukun sauyunan sakulawargi. Mangga sumping deui Iraha wae.',
    likes: 29,
  },
  {
    id: 'sr-4',
    name: 'Kang Asep Bobotoh',
    origin: 'Tarogong, Garut',
    category: 'Keluarga Bale Nobar',
    message:
      'Tempat nongkrong nobar Persib paling asik sa-Garut! Cemilannya mantap, kopina panceg, nu bogana bageur pisan. Hidup Persib, jaya Bumi Upi!',
    date: '28 Oktober 2026',
    nenekBlessing:
      'Aamiin ya rabbal alamin! Sing sumanget kasep, panceg galih dina kahadean.',
    likes: 56,
  },
];

const NENEK_BLESSINGS = [
  'Hatur nuhun anaking kasep/geulis. Sing barokah, sing sarehat, tur salawasna dina panangtayungan Gusti Nu Maha Suci.',
  'Dapur nenek salawasna haneut nyambut mulihna anaking. Tong hilap emam sangu liwet haneut sareng sambel hejo.',
  'Mugia sagala cita-cita anaking dipaparin kalancaran tur rido ti Gusti. Upi salawasna ngadungakeun di unggal sujud.',
  'Kudu landung kandungan laer aisan, sing jembar manah dina nyanghareupan sagala cobaan hirup.',
];

interface SuratRinduModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewMode?: boolean;
}

export const SuratRinduModal: React.FC<SuratRinduModalProps> = ({ isOpen, onClose, previewMode = false }) => {
  const [activeTab, setActiveTab] = useState<'write' | 'wall' | 'postcard'>('wall');
  const [letters, setLetters] = useState<SuratRindu[]>(PRESEEDED_SURAT);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [authorOrigin, setAuthorOrigin] = useState('');
  const [category, setCategory] = useState('Cucu yang Merantau');
  const [message, setMessage] = useState('');

  // Active Postcard for display
  const [activePostcard, setActivePostcard] = useState<SuratRindu | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bumi_surat_rindu');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLetters([...parsed, ...PRESEEDED_SURAT]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    const randomBlessing =
      NENEK_BLESSINGS[Math.floor(Math.random() * NENEK_BLESSINGS.length)];

    const newLetter: SuratRindu = {
      id: `sr-${Date.now()}`,
      name: authorName.trim(),
      origin: authorOrigin.trim() || 'Rantau',
      category,
      message: message.trim(),
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      nenekBlessing: randomBlessing,
      likes: 1,
    };

    const updated = [newLetter, ...letters];
    setLetters(updated);

    try {
      const customOnly = updated.filter((l) => !l.id.startsWith('sr-1') && !l.id.startsWith('sr-2') && !l.id.startsWith('sr-3') && !l.id.startsWith('sr-4'));
      localStorage.setItem('bumi_surat_rindu', JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    setActivePostcard(newLetter);
    setActiveTab('postcard');

    // Reset Form
    setAuthorName('');
    setAuthorOrigin('');
    setMessage('');
  };

  const handleLike = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, likes: l.likes + 1 } : l))
    );
  };

  const handleCopy = () => {
    if (activePostcard) {
      navigator.clipboard.writeText(
        `💌 Kartu Pos Surat Rindu Nenek Upi - Garut\nPengirim: ${activePostcard.name} (${activePostcard.origin})\n\nPesan: "${activePostcard.message}"\n\nDoa Nenek: "${activePostcard.nenekBlessing}"\n\nRumah Tamah Bumi Upi, Garut`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#2B2625]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[2.5rem] bg-[#FBF7EE] border-2 border-[#D4A24C] shadow-2xl p-5 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8DCC2]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4EADF] text-[#3E4F30] text-[10px] font-bold uppercase tracking-wider">
              <span>💌</span>
              <span>Pojok Nostalgia & Doa Sunda</span>
            </div>
            <h2
              className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Pojok Surat Rindu untuk Nenek Upi
            </h2>
            <p className="text-xs text-[#634E3F]">
              Titipkan sepucuk surat, curahan rindu kampung halaman, dan terima doa tulus dari Dapur Nenek Garut.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E8DCC2]/60 hover:bg-[#E8DCC2] text-[#634E3F] flex items-center justify-center text-sm font-bold transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-[#F5EEDC] border border-[#E0D4BA]">
          <button
            type="button"
            onClick={() => setActiveTab('wall')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'wall'
                ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-sm'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            <span>📜 Dinding Surat Pengunjung</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {letters.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'write'
                ? 'bg-[#B4532A] text-white shadow-sm'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            <span>✍️ Tulis Sepucuk Surat</span>
          </button>

          {activePostcard && (
            <button
              type="button"
              onClick={() => setActiveTab('postcard')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'postcard'
                  ? 'bg-[#D4A24C] text-[#2B2625] shadow-sm'
                  : 'text-[#634E3F] hover:text-[#2B2625]'
              }`}
            >
              <span>📮 Kartu Pos Anda</span>
            </button>
          )}
        </div>

        {/* TAB 1: WALL OF LETTERS */}
        {activeTab === 'wall' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#634E3F] px-1">
              <span>Untaian doa & rasa rindu dari cucu-cucu di seluruh Indonesia:</span>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className="font-bold text-[#B4532A] hover:underline"
              >
                + Tulis Surat Saya
              </button>
            </div>

            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className="p-5 rounded-2xl bg-white border border-[#E8DCC2] shadow-2xs hover:border-[#D4A24C] transition space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-[#2B2625]">
                          {letter.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5EEDC] text-[#8C7767] font-medium border border-[#E0D4BA]">
                          📍 {letter.origin}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#B4532A] font-semibold">
                        {letter.category} • {letter.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLike(letter.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#B4532A] px-2.5 py-1 rounded-lg bg-[#FCE7DF] hover:bg-[#FBE8E3] active:scale-95 transition"
                    >
                      <span>❤️</span>
                      <span>{letter.likes}</span>
                    </button>
                  </div>

                  <p
                    className="text-xs sm:text-sm text-[#4A3E38] italic leading-relaxed"
                    style={{ fontFamily: 'var(--font-caveat, "Caveat", Georgia, cursive)' }}
                  >
                    &ldquo;{letter.message}&rdquo;
                  </p>

                  {/* Nenek Blessing reply */}
                  <div className="pt-2.5 border-t border-[#E8DCC2]/60 flex items-start gap-2.5 bg-[#F9F6F0] p-3 rounded-xl border border-[#E8DCC2]/40">
                    <span className="text-xl">👵🏼</span>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#3E4F30] uppercase tracking-wider block">
                        Doa & Wangsit Nenek Upi:
                      </span>
                      <p className="text-xs text-[#2B2625] font-serif leading-snug">
                        {letter.nenekBlessing}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePostcard(letter);
                        setActiveTab('postcard');
                      }}
                      className="text-[11px] font-bold text-[#3E4F30] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Format Kartu Pos Tempo Doeloe →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WRITE LETTER */}
        {activeTab === 'write' && previewMode ? (
          <div className="p-8 rounded-3xl bg-white border-2 border-[#E8DCC2] text-center space-y-4 shadow-sm">
            <span className="text-4xl block">✍️</span>
            <div className="space-y-1">
              <h3
                className="font-serif font-bold text-lg sm:text-xl text-[#2B2625]"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Masuk Akun untuk Mengirim Surat Rindu
              </h3>
              <p className="text-xs text-[#634E3F] max-w-md mx-auto leading-relaxed">
                Silakan masuk atau daftarkan akun Keluarga Bumi terlebih dahulu agar pesan rindu Anda tercatat resmi dan menerima doa restu kartu pos ber-segel lilin digital.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Link
                href="/auth?mode=register"
                className="py-3 px-6 rounded-xl bg-[#B4532A] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Daftar / Masuk Akun Sekarang →
              </Link>
            </div>
          </div>
        ) : activeTab === 'write' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2B2625]">
                  Nama Anda / Cucu Rantau:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kang Gilang / Neng Resti"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2B2625]">
                  Kota Asal / Domisili:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta / Bandung / Garut"
                  value={authorOrigin}
                  onChange={(e) => setAuthorOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2625]">
                Kategori Kenangan:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
              >
                <option value="Cucu yang Merantau">Cucu yang Merantau (Obat Rindu)</option>
                <option value="Penikmat Masakan Tradisional">Penikmat Masakan Tradisional Priangan</option>
                <option value="Kenangan Masa Kecil">Kenangan Masakan Nenek Masa Kecil</option>
                <option value="Keluarga Bale Nobar">Keluarga Bale Nobar Persib</option>
                <option value="Doa & Syukur">Doa Kesembuhan & Keselamatan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2625]">
                Isi Surat Rindu / Pesan untuk Nenek Upi:
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan cerita, rasa syukur, atau kenangan masakan yang paling bikin Anda rindu pulang ke rumah..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30] resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E4EADF]/60 border border-[#3E4F30]/30 text-[11px] text-[#3E4F30] flex items-center gap-2">
              <span>💌</span>
              <span>
                Setiap surat yang terkirim akan langsung menerima balasan doa restu khas Priangan dan dicetak dalam kartu pos digital resmi.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('wall')}
                className="px-4 py-2.5 rounded-xl border border-[#E8DCC2] text-xs font-bold text-[#634E3F] hover:bg-white"
              >
                ← Kembali ke Dinding Surat
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#B4532A] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-2"
              >
                <span>Kirim Surat & Ambil Kartu Pos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: VINTAGE DIGITAL POSTCARD DISPLAY */}
        {activeTab === 'postcard' && activePostcard && (
          <div className="space-y-4">
            <div className="relative rounded-3xl bg-[#F6EED8] p-6 sm:p-8 border-4 border-[#8C6D46] shadow-xl text-[#2B2625] space-y-6 overflow-hidden">
              {/* Background texture watermark */}
              <div className="absolute top-4 right-4 pointer-events-none opacity-20">
                <span className="font-serif text-7xl font-black text-[#8C6D46]">1928</span>
              </div>

              {/* Postal Header */}
              <div className="flex items-start justify-between border-b-2 border-dashed border-[#8C6D46]/40 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-[#8C6D46] uppercase font-bold">
                    POSTKARTOE OFISIL BOEMI OEPI • GAROET
                  </span>
                  <h3
                    className="font-serif text-xl sm:text-2xl font-black text-[#3E4F30]"
                    style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                  >
                    ᮞᮥᮛᮒ᮪ ᮛᮤᮔ᮪ᮓᮥ • Surat Rindu
                  </h3>
                  <span className="text-[10px] text-[#634E3F]">
                    Dapur Arang No. 312, Garut Priangan Timur
                  </span>
                </div>

                {/* Vintage Postage Stamp with Perforations */}
                <div className="w-20 h-24 rounded-sm border-2 border-dashed border-[#B4532A] bg-[#FFF8EC] p-2 flex flex-col items-center justify-between text-center shadow-xs rotate-2">
                  <span className="text-[8px] font-bold text-[#8C6D46] tracking-tighter uppercase">
                    POS HINDIA
                  </span>
                  <span className="text-2xl">☕</span>
                  <span className="text-[8px] font-bold text-[#B4532A]">15 SEN</span>
                </div>
              </div>

              {/* Postcard Body Split: Left Message, Right Recipient & Seal */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Handwritten Message */}
                <div className="md:col-span-7 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D46]">
                    Catatan Kasih & Rindu:
                  </span>
                  <p
                    className="text-sm sm:text-base text-[#2B2625] leading-relaxed italic"
                    style={{ fontFamily: 'var(--font-caveat, "Caveat", Georgia, cursive)' }}
                  >
                    &ldquo;{activePostcard.message}&rdquo;
                  </p>

                  <div className="pt-2 text-xs font-serif text-[#634E3F]">
                    — Tertanda cucu rindu:{' '}
                    <strong className="text-[#2B2625]">{activePostcard.name}</strong> (
                    {activePostcard.origin})
                  </div>
                </div>

                {/* Right: Blessing & Wax Seal */}
                <div className="md:col-span-5 space-y-4 md:border-l-2 md:border-dashed md:border-[#8C6D46]/40 md:pl-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E4F30]">
                      Doa Dari Nenek Upi:
                    </span>
                    <p className="font-serif text-xs text-[#2B2625] leading-relaxed italic bg-white/60 p-3 rounded-xl border border-[#D5C7B0]">
                      &ldquo;{activePostcard.nenekBlessing}&rdquo;
                    </p>
                  </div>

                  {/* Red Wax Seal Simulation */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A52A2A] via-[#8B0000] to-[#5C0000] text-amber-200 flex flex-col items-center justify-center shadow-lg border-2 border-amber-300/40 rotate-[-8deg] shrink-0">
                      <span className="text-[9px] font-serif font-black tracking-tighter">BU</span>
                      <span className="text-[7px] font-mono tracking-widest">GARUT</span>
                    </div>
                    <div className="text-[10px] text-[#634E3F]">
                      <span className="font-bold text-[#8B0000] block">SEGEL LILIN RESMI</span>
                      <span>Dapur Nenek Bumi Upi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stamp Date */}
              <div className="pt-3 border-t border-[#8C6D46]/20 flex items-center justify-between text-[10px] text-[#8C6D46]">
                <span>CAP POS: GARUT TAROGONG • {activePostcard.date}</span>
                <span className="font-bold">ᮞᮙ᮪ᮕᮥᮛᮃᮞᮥᮔ᮪</span>
              </div>
            </div>

            {/* Actions for Postcard */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('wall')}
                className="text-xs font-bold text-[#634E3F] hover:underline"
              >
                ← Lihat Surat Pengunjung Lainnya
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-4 rounded-xl bg-white border border-[#D4A24C] text-[#2B2625] text-xs font-bold hover:bg-[#F5EEDC] shadow-2xs transition flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#3E4F30]" /> : <span>📋</span>}
                  <span>{copiedLink ? 'Tersalin!' : 'Salin Kutipan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 shadow-xs transition flex items-center gap-1.5"
                >
                  <span>🖨️ Cetak / Unduh Kartu Pos</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
