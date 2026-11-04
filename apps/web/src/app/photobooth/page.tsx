'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

interface FrameTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  subtextColor: string;
  headerText: string;
  footerText: string;
  borderColor: string;
  badge: string;
}

const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'frame-teak',
    name: 'Bumi Upi 1930 (Teak Wood)',
    bgColor: '#3D2817',
    textColor: '#F5EEDC',
    subtextColor: '#D4A24C',
    headerText: '✤ BUMI UPI GARUT ✤',
    footerText: 'Jl. Cimanuk 312 • Est. 1930',
    borderColor: '#D4A24C',
    badge: 'Klasik Retro'
  },
  {
    id: 'frame-krepyak',
    name: 'Rumah Nenek Priangan',
    bgColor: '#2B3A21',
    textColor: '#F5EEDC',
    subtextColor: '#C2D9B3',
    headerText: '✤ RUMAH TAMAH BUMI UPI ✤',
    footerText: 'Kisah Rasa & Kehangatan Nenek',
    borderColor: '#789564',
    badge: 'Hijau Kolonial'
  },
  {
    id: 'frame-terakota',
    name: 'Nostalgia Terakota',
    bgColor: '#7A3215',
    textColor: '#FDF7EE',
    subtextColor: '#E8B69E',
    headerText: '✤ MOMEN HANGAT GARUT ✤',
    footerText: 'Salatri Sembuh di Bumi Upi',
    borderColor: '#B4532A',
    badge: 'Bata Merah'
  },
  {
    id: 'frame-wedding',
    name: 'Intimate Wedding & Love',
    bgColor: '#FAF6EE',
    textColor: '#2B2625',
    subtextColor: '#8C6C38',
    headerText: '✤ FOREVER IN LOVE @ BUMI UPI ✤',
    footerText: 'Janji Suci di Rumah Nenek Garut',
    borderColor: '#D4A24C',
    badge: 'Edisi Wedding'
  }
];

const FILTERS = [
  { id: 'normal', name: 'Asli (Natural)', css: 'none' },
  { id: 'sepia', name: 'Sepia 1930', css: 'sepia(0.65) contrast(1.08) brightness(0.98)' },
  { id: 'bw', name: 'Hitam Putih Klasik', css: 'grayscale(1) contrast(1.2)' },
  { id: 'warm', name: 'Warm Glow Priangan', css: 'saturate(1.25) contrast(1.05) brightness(1.03) sepia(0.2)' }
];

export default function PhotoboothPage() {
  const { tableNumber } = useCart();

  // Mode: 'camera' | 'upload'
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate>(FRAME_TEMPLATES[0]);
  const [selectedFilter, setSelectedFilter] = useState<string>('sepia');
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentPoseIdx, setCurrentPoseIdx] = useState<number>(0);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [generatedStripUrl, setGeneratedStripUrl] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerTable, setCustomerTable] = useState<string>(tableNumber !== 'Takeaway' ? tableNumber : 'Meja 04');
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [customCaption, setCustomCaption] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inisialisasi Kamera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Silakan aktifkan izin kamera di browser, atau gunakan mode "Unggah Foto dari Galeri" di bawah.');
      setCaptureMode('upload');
    }
  }, [facingMode]);

  useEffect(() => {
    if (captureMode === 'camera') {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [captureMode, startCamera]);

  // Tombol Ganti Kamera Depan / Belakang
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Jepret 1 Foto dari Stream Video
  const takeSingleSnapshot = () => {
    if (!videoRef.current) return '';
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Jika kamera depan, flip mirror
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Timer hitung mundur 3..2..1 lalu jepret
  const triggerCountdownAndSnap = () => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdownNum(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(interval);
        setIsCountingDown(false);
        const photo = takeSingleSnapshot();
        if (photo) {
          setCapturedPhotos((prev) => {
            const next = [...prev, photo];
            if (next.length > 3) return [photo];
            return next;
          });
          setCurrentPoseIdx((prev) => (prev + 1) % 3);
        }
      }
    }, 1000);
  };

  // Otomatis 3 Poses Sekaligus (3-Strip Photobooth Session)
  const runFull3PoseSession = () => {
    if (isCountingDown) return;
    setCapturedPhotos([]);
    let poseCount = 0;

    const doNextPose = () => {
      setIsCountingDown(true);
      setCountdownNum(3);
      let count = 3;

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownNum(count);
        } else {
          clearInterval(interval);
          setIsCountingDown(false);
          const photo = takeSingleSnapshot();
          if (photo) {
            setCapturedPhotos((prev) => [...prev, photo]);
            poseCount++;
            if (poseCount < 3) {
              setTimeout(doNextPose, 1200);
            }
          }
        }
      }, 1000);
    };

    doNextPose();
  };

  // Handle Unggah Foto dari File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    const readPromises = Array.from(files).slice(0, 3).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(() => {
      setCapturedPhotos(newPhotos.slice(0, 3));
    });
  };

  // Render High-Resolution 3-Strip Photobooth Canvas
  const renderStripCanvas = useCallback(() => {
    if (capturedPhotos.length === 0) return;

    const canvas = document.createElement('canvas');
    const width = 640;
    // Format strip vertikal standar: Header (180px) + 3 foto (each 420px + margin) + Footer (160px)
    const photoCount = Math.max(1, capturedPhotos.length);
    const photoH = 430;
    const photoW = 540;
    const gap = 30;
    const topPadding = 160;
    const bottomPadding = 180;
    const totalHeight = topPadding + photoCount * photoH + (photoCount - 1) * gap + bottomPadding;

    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Frame
    ctx.fillStyle = selectedFrame.bgColor;
    ctx.fillRect(0, 0, width, totalHeight);

    // Border Frame halus
    ctx.strokeStyle = selectedFrame.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, width - 20, totalHeight - 20);

    // 2. Header Text
    ctx.fillStyle = selectedFrame.textColor;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedFrame.headerText, width / 2, 70);

    ctx.fillStyle = selectedFrame.subtextColor;
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('Rumah Tamah & Kopi Garut • Jl. Cimanuk 312', width / 2, 100);

    // Garis ornamen
    ctx.strokeStyle = selectedFrame.subtextColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, 120);
    ctx.lineTo(width - 120, 120);
    ctx.stroke();

    // 3. Render Setiap Foto dengan Filter yang Dipilih
    const loadAndDrawPhoto = (src: string, yPos: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Buat sub-canvas untuk menerapkan filter CSS
          const subCanvas = document.createElement('canvas');
          subCanvas.width = photoW;
          subCanvas.height = photoH;
          const subCtx = subCanvas.getContext('2d');
          if (subCtx) {
            const filterObj = FILTERS.find((f) => f.id === selectedFilter);
            if (filterObj && filterObj.css !== 'none') {
              subCtx.filter = filterObj.css;
            }
            // Draw cropped to fill
            const srcAspect = img.width / img.height;
            const targetAspect = photoW / photoH;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (srcAspect > targetAspect) {
              sw = img.height * targetAspect;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / targetAspect;
              sy = (img.height - sh) / 2;
            }
            subCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoW, photoH);

            // Border polaroid putih tipis di sekitar foto
            const xPos = (width - photoW) / 2;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(xPos - 6, yPos - 6, photoW + 12, photoH + 12);
            ctx.drawImage(subCanvas, xPos, yPos, photoW, photoH);
          }
          resolve();
        };
        img.src = src;
      });
    };

    let startY = topPadding;
    const drawPromises = capturedPhotos.map((pSrc, idx) => {
      const y = startY + idx * (photoH + gap);
      return loadAndDrawPhoto(pSrc, y);
    });

    Promise.all(drawPromises).then(() => {
      // 4. Footer & Watermark
      const footerY = totalHeight - 120;
      ctx.fillStyle = selectedFrame.textColor;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(customCaption || selectedFrame.footerText, width / 2, footerY);

      // Tanggal & Jam Cetak WIB
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      ctx.fillStyle = selectedFrame.subtextColor;
      ctx.font = '13px monospace';
      ctx.fillText(`${dateStr} • ${timeStr} • Meja: ${customerTable}`, width / 2, footerY + 30);

      ctx.font = 'italic 12px Georgia, serif';
      ctx.fillText('Simpan kenangan, abadikan senyuman di Bumi Upi', width / 2, footerY + 52);

      setGeneratedStripUrl(canvas.toDataURL('image/png'));
    });
  }, [capturedPhotos, selectedFrame, selectedFilter, customCaption, customerTable]);

  useEffect(() => {
    if (capturedPhotos.length > 0) {
      renderStripCanvas();
    }
  }, [capturedPhotos, selectedFrame, selectedFilter, customCaption, renderStripCanvas]);

  // Unduh Soft File (Download File Gambar HD)
  const handleDownloadSoftFile = () => {
    if (!generatedStripUrl) return;
    const link = document.createElement('a');
    link.href = generatedStripUrl;
    link.download = `Photobox_Bumi_Upi_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pesan Cetak Fisik via WhatsApp ke nomor 0895412055152
  const handleOrderPhysicalPrint = () => {
    const name = customerName.trim() || 'Tamu Bumi Upi';
    const table = customerTable.trim() || 'Meja 04';
    const frameName = selectedFrame.name;

    const message = `Sampurasun Admin Bumi Upi Garut! 📸\n\nSaya ingin memesan *Cetak Fisik Photobox (2 Strip)* dari Web Portal:\n• Nama Pemesan: *${name}*\n• Nomor Meja / Lokasi: *${table}*\n• Pilihan Frame: *${frameName}*\n• Jumlah: 2 Strip Cetak Fisik Instan\n• Total Biaya: *Rp 25.000* (Bayar di kasir / meja)\n\nFile foto sudah saya simpan dan siap dicetak oleh crew Dapur/Kasir Bumi Upi. Hatur nuhun! 🌿`;

    const waUrl = `https://wa.me/62895412055152?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setShowOrderModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header Hero */}
      <div className="bg-gradient-to-r from-[#2B3A21] via-[#3E4F30] to-[#1F2B17] text-[#F5EEDC] p-6 sm:p-8 rounded-[2rem] border-2 border-[#D4A24C]/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4A24C]/20 border border-[#D4A24C]/50 text-[#D4A24C] text-[11px] font-bold uppercase tracking-wider">
            <span>📸</span>
            <span>Bilik Foto Vintage Bumi Upi Garut</span>
          </div>
          <h1
            className="font-serif text-2xl sm:text-4xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Photobox Vintage & Cetak Kenangan
          </h1>
          <p className="text-xs sm:text-sm text-[#E0D4BA] leading-relaxed">
            Abadikan momen santap bareng keluarga dan sahabat di Jl. Cimanuk 312 Garut!
            Ambil 3 pose seru, pilih frame jadul estetik, lalu <strong>unduh Soft File HD (Gratis)</strong> atau <strong>pesan Cetak Fisik 2 Strip (Rp 25.000)</strong> langsung diantar ke meja Anda!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href="/wedding"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs text-center transition"
          >
            <span>💍 Sewa untuk Wedding / Event →</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Camera / Capture Control (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FBF7EE] p-5 sm:p-6 rounded-3xl border border-[#E8DCC2] shadow-sm space-y-5">
          {/* Switch Mode: Kamera vs Upload */}
          <div className="flex items-center justify-between border-b border-[#E8DCC2] pb-3">
            <span className="text-xs font-bold text-[#2B2625] uppercase tracking-wider">
              Mode Pemotretan:
            </span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8DCC2]">
              <button
                type="button"
                onClick={() => setCaptureMode('camera')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  captureMode === 'camera'
                    ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-2xs'
                    : 'text-[#634E3F] hover:bg-[#F5EEDC]'
                }`}
              >
                <span>📷 Kamera Live</span>
              </button>
              <button
                type="button"
                onClick={() => setCaptureMode('upload')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  captureMode === 'upload'
                    ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-2xs'
                    : 'text-[#634E3F] hover:bg-[#F5EEDC]'
                }`}
              >
                <span>📁 Unggah Foto</span>
              </button>
            </div>
          </div>

          {/* Kamera Viewfinder / Upload Area */}
          {captureMode === 'camera' ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border-2 border-[#D4A24C]/40 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                style={{
                  filter: FILTERS.find((f) => f.id === selectedFilter)?.css || 'none'
                }}
              />

              {/* Viewfinder Overlay Guides */}
              <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-center text-[10px] text-white/70 font-mono">
                  <span>✤ BUMI UPI GARUT</span>
                  <span>POSE {capturedPhotos.length + 1} / 3</span>
                </div>
                <div className="text-center text-[10px] text-white/60 font-mono">
                  + PUSATKAN WAJAH DI AREA KOTAK +
                </div>
              </div>

              {/* Countdown Overlay */}
              {isCountingDown && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center animate-fade-in">
                  <span className="font-serif text-8xl font-black text-[#D4A24C] animate-ping select-none">
                    {countdownNum}
                  </span>
                </div>
              )}

              {/* Toggle Front/Back Camera */}
              <button
                type="button"
                onClick={handleToggleCamera}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs border border-white/20 backdrop-blur-xs transition"
                title="Ganti Kamera Depan / Belakang"
              >
                🔄 Putar Kamera
              </button>

              {cameraError && (
                <div className="absolute inset-0 bg-black/85 p-6 flex flex-col items-center justify-center text-center space-y-3 text-[#F5EEDC]">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-xs text-amber-200">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setCaptureMode('upload')}
                    className="py-2 px-4 rounded-xl bg-[#D4A24C] text-[#2B2625] text-xs font-bold"
                  >
                    Gunakan Mode Unggah Foto Saja
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#D4A24C] rounded-2xl p-8 text-center bg-white space-y-3">
              <span className="text-4xl block">🖼️</span>
              <h3 className="font-bold text-sm text-[#2B2625]">
                Unggah 1 sampai 3 Foto Kenangan Anda
              </h3>
              <p className="text-xs text-[#634E3F] max-w-sm mx-auto">
                Pilih foto dari galeri HP atau komputer Anda untuk digabungkan ke dalam strip photobox vintage Bumi Upi.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-5 rounded-xl bg-[#3E4F30] hover:bg-[#2F3D24] text-[#F5EEDC] text-xs font-bold shadow-xs transition"
              >
                Pilih File dari Perangkat
              </button>
            </div>
          )}

          {/* Capture Trigger Buttons */}
          {captureMode === 'camera' && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={runFull3PoseSession}
                disabled={isCountingDown}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>✨ Otomatis 3 Pose (3-Strip Photobox)</span>
              </button>

              <button
                type="button"
                onClick={triggerCountdownAndSnap}
                disabled={isCountingDown}
                className="py-3 px-4 rounded-xl bg-[#3E4F30] hover:bg-[#2F3D24] text-[#F5EEDC] font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-50"
                title="Ambil satu pose foto sekarang"
              >
                <span>📸 Jepret 1 Pose</span>
              </button>

              {capturedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCapturedPhotos([])}
                  className="py-3 px-3 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold text-xs transition"
                  title="Hapus foto dan ulang sesi pemotretan"
                >
                  Ulang
                </button>
              )}
            </div>
          )}

          {/* Captured Thumbnails Preview */}
          {capturedPhotos.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#E8DCC2]">
              <span className="text-[11px] font-bold text-[#634E3F] uppercase tracking-wider block">
                Foto Terkumpul ({capturedPhotos.length} / 3 Pose):
              </span>
              <div className="flex gap-2">
                {capturedPhotos.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D4A24C] shadow-2xs group"
                  >
                    <img src={p} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/60 text-white px-1.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pilihan Filter Efek Vintage */}
          <div className="space-y-2 pt-2 border-t border-[#E8DCC2]">
            <span className="text-[11px] font-bold text-[#2B2625] uppercase tracking-wider block">
              Pilih Filter Kamera Vintage:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                    selectedFilter === f.id
                      ? 'border-[#B4532A] bg-[#B4532A] text-white shadow-2xs font-bold'
                      : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan 4 Frame Template */}
          <div className="space-y-2 pt-2 border-t border-[#E8DCC2]">
            <span className="text-[11px] font-bold text-[#2B2625] uppercase tracking-wider block">
              Pilih Desain Frame Vintage Bumi Upi:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FRAME_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedFrame(tmpl)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedFrame.id === tmpl.id
                      ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
                      : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{tmpl.name}</div>
                    <div className="text-[10px] opacity-75">{tmpl.badge}</div>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border border-white/40"
                    style={{ backgroundColor: tmpl.bgColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Caption Input */}
          <div className="space-y-1.5 pt-2 border-t border-[#E8DCC2]">
            <label className="text-[11px] font-bold text-[#2B2625] uppercase tracking-wider block">
              Tulisan Catatan Khusus di Bawah Frame (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Kencan Pertama Upi & Asep • 2026"
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full text-xs px-3.5 py-2 bg-white border border-[#E8DCC2] rounded-xl text-[#2B2625] focus:outline-none focus:ring-1 focus:ring-[#3E4F30]"
            />
          </div>
        </div>

        {/* Right Column: Strip Preview & Output Actions (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FBF7EE] p-5 sm:p-6 rounded-3xl border border-[#E8DCC2] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#E8DCC2] pb-3">
            <span className="text-xs font-bold text-[#2B2625] uppercase tracking-wider">
              Hasil Strip Photobox
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Preview
            </span>
          </div>

          {/* Strip Display */}
          <div className="flex justify-center bg-stone-900/10 p-4 rounded-2xl border border-[#E8DCC2] min-h-[360px] items-center">
            {generatedStripUrl ? (
              <img
                src={generatedStripUrl}
                alt="Hasil Photobox Bumi Upi"
                className="max-h-[520px] w-auto shadow-2xl rounded-sm object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-2 text-[#8C7767]">
                <span className="text-4xl block">🎞️</span>
                <p className="text-xs font-semibold">Belum ada foto yang diambil.</p>
                <p className="text-[11px] text-[#A69080]">
                  Gunakan tombol kamera di sebelah kiri untuk berpose atau unggah foto dari galeri Anda.
                </p>
              </div>
            )}
          </div>

          {/* Output Action Buttons: Soft File vs Cetak Fisik */}
          <div className="space-y-2.5 pt-2">
            {/* Aksi 1: Unduh Soft File (Gratis) */}
            <button
              type="button"
              onClick={handleDownloadSoftFile}
              disabled={!generatedStripUrl}
              className="w-full py-3 px-4 rounded-xl bg-[#3E4F30] hover:bg-[#2F3D24] text-[#F5EEDC] font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
            >
              <span>📥 Unduh Soft File HD (Gratis)</span>
            </button>

            {/* Aksi 2: Pesan Cetak Fisik Rp 25.000 */}
            <button
              type="button"
              onClick={() => setShowOrderModal(true)}
              disabled={!generatedStripUrl}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
            >
              <span>🖨️ Pesan Cetak Fisik (Rp 25.000 / 2 Strip)</span>
            </button>

            <p className="text-[10px] text-center text-[#8C7767] pt-1">
              * Hasil cetak fisik menggunakan kertas foto tebal premium anti-luntur langsung dari printer photo booth Bumi Upi.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Modal Konfirmasi Pemesanan Cetak Fisik */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FBF7EE] border-2 border-[#D4A24C] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowOrderModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-[#634E3F] border border-[#E8DCC2] flex items-center justify-center font-bold text-xs hover:bg-[#F5EEDC]"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-3xl block">🖨️</span>
              <h3 className="font-serif text-lg font-bold text-[#2B2625]">
                Pesan Cetak Fisik Strip Foto
              </h3>
              <p className="text-xs text-[#634E3F]">
                Hasil foto akan dicetak 2 rangkap (strip) dan langsung diantarkan ke meja Anda!
              </p>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#E8DCC2] text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2B2625] block">Nama Pemesan:</label>
                <input
                  type="text"
                  placeholder="Nama Kakak..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-xl text-[#2B2625] focus:outline-none focus:ring-1 focus:ring-[#3E4F30]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2B2625] block">Nomor Meja Antaran:</label>
                <input
                  type="text"
                  placeholder="Contoh: Meja 04 atau Kasir"
                  value={customerTable}
                  onChange={(e) => setCustomerTable(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-xl text-[#2B2625] focus:outline-none focus:ring-1 focus:ring-[#3E4F30]"
                />
              </div>

              <div className="pt-2 border-t border-[#E8DCC2] flex justify-between items-center font-bold">
                <span className="text-[#634E3F]">Biaya Cetak 2 Strip:</span>
                <span className="font-mono text-base text-[#3E4F30]">Rp 25.000</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOrderPhysicalPrint}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>💬 Kirim Pesanan via WhatsApp (0895-4120-55152) →</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="w-full py-2 text-xs font-bold text-[#634E3F] hover:underline"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
