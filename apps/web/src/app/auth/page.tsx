'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  User,
  Mail,
  WhatsApp,
  Sparkles,
  ArrowLeft,
  Check
} from '../../components/icons';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    customer,
    isLoggedIn,
    switchCustomer,
    logout,
    requestOtp,
    verifyOtp,
    demoUsers,
    activeOtpState
  } = useAuth();

  // Mode: 'login' vs 'register'
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authTab, setAuthTab] = useState<'login' | 'register'>(initialMode);

  // Steps: 'form' -> 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Registration Fields (Nama, Email, No HP)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('081234567890');

  // OTP Input Boxes State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Countdown timer for OTP resend (60 seconds)
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // WhatsApp deep link for manual customer service help if needed
  const [whatsappCsUrl, setWhatsappCsUrl] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update tab if URL search param changes
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setAuthTab('register');
    } else if (modeParam === 'login') {
      setAuthTab('login');
    }
  }, [searchParams]);

  // Countdown timer effect during OTP step
  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  // Listen to custom autofill event triggered by the WhatsApp top push notification
  useEffect(() => {
    const handleAutofill = (e: any) => {
      const code = e.detail?.code;
      if (code && typeof code === 'string' && code.length === 6) {
        fillAndVerify(code);
      }
    };

    window.addEventListener('bumi-autofill-otp', handleAutofill);
    return () => window.removeEventListener('bumi-autofill-otp', handleAutofill);
  }, [phoneNumber, name, email, authTab]);

  // Request OTP for Login or Registration
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMsg(null);

    // Form validations
    if (authTab === 'register') {
      if (!name.trim()) {
        setStatusMsg({ text: 'Nama lengkap wajib diisi untuk pendaftaran', type: 'error' });
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setStatusMsg({ text: 'Alamat email aktif yang valid wajib diisi', type: 'error' });
        return;
      }
    }

    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 8) {
      setStatusMsg({ text: 'Nomor WhatsApp minimal 8 digit angka', type: 'error' });
      return;
    }

    setLoading(true);

    const res = await requestOtp(phoneNumber, {
      mode: authTab,
      name: authTab === 'register' ? name.trim() : undefined,
      email: authTab === 'register' ? email.trim() : undefined,
    });

    setLoading(false);

    if (res.success) {
      if (res.whatsappCsUrl) {
        setWhatsappCsUrl(res.whatsappCsUrl);
      }

      setStep('otp');
      setOtpCode(['', '', '', '', '', '']);
      setResendTimer(60);
      setCanResend(false);
      setStatusMsg(null);

      // Focus first digit input automatically
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } else {
      setStatusMsg({ text: res.error || 'Gagal mengirim kode ke WhatsApp', type: 'error' });
    }
  };

  // Function to fill code and auto-trigger verification
  const fillAndVerify = (code: string) => {
    const digits = code.split('').slice(0, 6);
    setOtpCode(digits);
    if (digits.length === 6) {
      executeVerify(code);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const newCode = [...otpCode];
    newCode[index] = clean;
    setOtpCode(newCode);

    // Auto move to next input box
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit as soon as the 6th digit is entered
    if (clean && index === 5) {
      const full = newCode.join('');
      if (full.length === 6) {
        executeVerify(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      fillAndVerify(pasted);
    }
  };

  const executeVerify = async (fullCode: string) => {
    if (loading || isSuccess) return;
    setLoading(true);
    setStatusMsg(null);

    const res = await verifyOtp(phoneNumber, fullCode, {
      name: authTab === 'register' ? name.trim() : undefined,
      email: authTab === 'register' ? email.trim() : undefined,
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/member');
      }, 900);
    } else {
      setStatusMsg({ text: res.error || 'Kode OTP tidak sesuai. Silakan coba lagi.', type: 'error' });
      // Reset inputs and focus first box
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const formattedPhoneDisplay = () => {
    const clean = phoneNumber.replace(/\D/g, '').replace(/^0/, '').replace(/^62/, '');
    return `+62 ${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      {/* Main Form Container Card */}
      <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden text-[#2B2625]">
        
        {/* SUCCESS CELEBRATION OVERLAY */}
        {isSuccess && (
          <div className="absolute inset-0 bg-[#FBF7EE] z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#3E4F30] text-[#D4A24C] flex items-center justify-center text-3xl shadow-lg animate-bounce">
              ✓
            </div>
            <div className="space-y-1">
              <h2
                className="font-serif text-2xl font-bold text-[#3E4F30]"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                {authTab === 'register' ? 'Pendaftaran Berhasil!' : 'Selamat Datang Kembali!'}
              </h2>
              <p className="text-xs text-[#634E3F] max-w-xs">
                {authTab === 'register'
                  ? 'Selamat bergabung di Keluarga Bumi. 50 Poin Selamat Datang telah ditambahkan!'
                  : 'Berhasil masuk ke akun Anda. Mengalihkan ke kartu member...'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#3E4F30] pt-2">
              <span className="animate-spin">🌿</span>
              <span>Membuka Halaman Member...</span>
            </div>
          </div>
        )}

        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#3E4F30] text-[#F5EEDC] flex items-center justify-center p-2.5 shadow-sm border border-[#D4A24C]/40">
            <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" className="w-full h-full object-contain" />
          </div>

          {step === 'form' ? (
            <>
              <h1
                className="font-serif text-2xl font-bold text-[#2B2625] pt-1"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                {authTab === 'register' ? 'Mari Bertamu ke Keluarga Bumi' : 'Ketuk Pintu Rumah Nenek'}
              </h1>
              <p className="text-xs text-[#634E3F]">
                {authTab === 'register'
                  ? 'Nikmati 50 Poin Bonus Sambutan & Voucher Traktiran Nenek Upi'
                  : 'Masukkan nomor WhatsApp Baraya untuk mengecek poin & traktiran'}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex items-center gap-1 text-xs text-[#B4532A] font-bold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ubah Nomor</span>
                </button>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4EADF] text-[#3E4F30]">
                  Langkah 2 dari 2
                </span>
              </div>
              <h1
                className="font-serif text-2xl font-bold text-[#2B2625] pt-1"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Verifikasi WhatsApp OTP
              </h1>
              <p className="text-xs text-[#634E3F]">
                Kode 6 digit telah dikirimkan ke WhatsApp <strong className="text-[#2B2625]">{formattedPhoneDisplay()}</strong>
              </p>
            </>
          )}
        </div>

        {/* Current status if already logged in */}
        {isLoggedIn && customer && step === 'form' && (
          <div className="p-4 bg-[#E4EADF] border border-[#3E4F30] rounded-2xl text-xs text-[#2B2625] space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3E4F30] flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Aktif sebagai: {customer.name}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A24C] text-[#2B2625] font-bold">
                Tier {customer.tier}
              </span>
            </div>
            <p className="text-[11px] text-[#634E3F]">
              WA: <span className="font-mono font-semibold">{customer.phone}</span> • Saldo: <span className="font-bold text-[#3E4F30]">{customer.pointsBalance} Poin</span>
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/member')}
                className="py-1.5 px-3 rounded-lg bg-[#3E4F30] text-white text-xs font-bold hover:brightness-110"
              >
                Buka Kartu Member →
              </button>
              <button
                type="button"
                onClick={logout}
                className="py-1.5 px-3 rounded-lg border border-[#B4532A] text-[#B4532A] text-xs font-semibold hover:bg-white"
              >
                Keluar Akun
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: TAB NAVIGATION (Masuk vs Daftar) */}
        {step === 'form' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EFE7D5] border border-[#E0D4BA] gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setStatusMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authTab === 'login'
                  ? 'bg-white text-[#3E4F30] shadow-xs'
                  : 'text-[#634E3F] hover:text-[#2B2625]'
              }`}
            >
              <span className="text-sm">🔑</span>
              <span>Ketuk Pintu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setStatusMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authTab === 'register'
                  ? 'bg-[#B4532A] text-white shadow-xs'
                  : 'text-[#634E3F] hover:text-[#2B2625]'
              }`}
            >
              <span className="text-sm">🏡</span>
              <span>Mari Bertamu</span>
            </button>
          </div>
        )}

        {/* STEP 1: FORM INPUTS */}
        {step === 'form' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
            {/* If Register Mode: Name & Email inputs */}
            {authTab === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-[#3E4F30]" />
                    <span>Nama Lengkap *</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Rohmah atau Dimas Kurniawan"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DCC2] bg-white text-xs font-medium text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#3E4F30]" />
                    <span>Alamat Email Aktif *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DCC2] bg-white text-xs font-medium text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                    required
                  />
                  <p className="text-[11px] text-[#8C7767] mt-1">
                    Untuk bukti struk digital & traktiran ulang tahun.
                  </p>
                </div>
              </>
            )}

            {/* WhatsApp Phone Number */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] flex items-center gap-1.5 mb-1.5">
                <WhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Nomor WhatsApp *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#634E3F] select-none">
                  🇮🇩 +62
                </span>
                <input
                  type="tel"
                  value={phoneNumber.replace(/^\+62/, '').replace(/^0/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="81234567890"
                  className="w-full pl-16 pr-4 py-3 rounded-xl border border-[#E8DCC2] bg-white text-xs font-mono font-semibold text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#8C7767] mt-1">
                {authTab === 'register'
                  ? 'Kode verifikasi 6 digit akan langsung dikirimkan ke WhatsApp Anda.'
                  : 'Gunakan nomor WhatsApp terdaftar Anda.'}
              </p>
            </div>

            {/* Register Benefits Banner */}
            {authTab === 'register' && (
              <div className="p-3.5 rounded-2xl bg-[#E4EADF] border border-[#3E4F30]/30 space-y-1 text-xs text-[#2B2625]">
                <div className="flex items-center gap-2 font-bold text-[#3E4F30]">
                  <Sparkles className="w-4 h-4 text-[#D4A24C]" />
                  <span>Keuntungan Anggota Baru:</span>
                </div>
                <ul className="text-[11px] text-[#4A5D3B] space-y-0.5 pl-5 list-disc">
                  <li>Bonus langsung <strong>50 Poin Selamat Datang</strong></li>
                  <li>Putar <strong>Traktiran Harian Nenek</strong> setiap hari</li>
                  <li>Struk otomatis terkirim rapi ke WhatsApp</li>
                </ul>
              </div>
            )}

            {/* Status Message */}
            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  statusMsg.type === 'success'
                    ? 'bg-[#E4EADF] border-[#3E4F30] text-[#3E4F30]'
                    : 'bg-[#FBE8E3] border-[#B4532A] text-[#B4532A]'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 disabled:opacity-50 ${
                authTab === 'register' ? 'bg-[#3E4F30]' : 'bg-[#B4532A]'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Mengirim Kode Verifikasi...</span>
                </>
              ) : authTab === 'register' ? (
                <>
                  <span>Lanjutkan & Terima Kode OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <WhatsApp className="w-4 h-4 text-[#25D366]" />
                  <span>Kirim Kode WhatsApp OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFIKASI KODE OTP (REAL APP EXPERIENCE) */}
        {step === 'otp' && (
          <div className="space-y-6 text-left">
            {/* 6 Square Digit Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#634E3F] block text-center">
                Ketik 6 Angka Kode Verifikasi:
              </label>

              <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center font-mono text-2xl font-bold rounded-2xl border-2 border-[#E8DCC2] bg-white text-[#3E4F30] focus:outline-none focus:border-[#3E4F30] focus:ring-4 focus:ring-[#3E4F30]/15 shadow-xs transition"
                  />
                ))}
              </div>
            </div>

            {/* Smart Keyboard Auto-Fill Bar (Like iOS / Android suggestion) */}
            {activeOtpState?.otpCode && (
              <div className="p-2.5 rounded-xl bg-[#E4EADF] border border-[#3E4F30]/30 flex items-center justify-between text-xs">
                <span className="text-[#3E4F30] font-medium flex items-center gap-1.5">
                  <WhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Kode masuk: <strong className="font-mono font-bold">{activeOtpState.otpCode}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => fillAndVerify(activeOtpState.otpCode)}
                  className="py-1 px-3 rounded-lg bg-[#3E4F30] text-[#F5EEDC] text-[11px] font-bold hover:brightness-110 active:scale-95 transition"
                >
                  Tempel Kode
                </button>
              </div>
            )}

            {/* Status Message */}
            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border text-center ${
                  statusMsg.type === 'success'
                    ? 'bg-[#E4EADF] border-[#3E4F30] text-[#3E4F30]'
                    : 'bg-[#FBE8E3] border-[#B4532A] text-[#B4532A]'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Verify Action Button */}
            <button
              type="button"
              onClick={() => executeVerify(otpCode.join(''))}
              disabled={loading || otpCode.join('').length !== 6}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 disabled:opacity-40"
              style={{ backgroundColor: '#3E4F30' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>
                    {authTab === 'register'
                      ? 'Selesaikan Pendaftaran & Klaim Bonus'
                      : 'Verifikasi & Masuk'}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#D4A24C]" />
                </>
              )}
            </button>

            {/* Resend Countdown Timer */}
            <div className="text-center space-y-2 pt-2 border-t border-[#E8DCC2]/60">
              <p className="text-xs text-[#634E3F]">
                {!canResend ? (
                  <span>
                    Kirim ulang kode dalam <strong className="font-mono text-[#3E4F30]">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    className="font-bold text-[#B4532A] hover:underline"
                  >
                    🔄 Kirim Ulang Kode via WhatsApp
                  </button>
                )}
              </p>

              {whatsappCsUrl && (
                <p className="text-[11px] text-[#8C7767]">
                  Belum menerima kode?{' '}
                  <a
                    href={whatsappCsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-bold hover:underline"
                  >
                    Bantuan CS WhatsApp Bumi Upi
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Demo Switcher Section (Hanya tampil di tab Masuk form) */}
        {step === 'form' && authTab === 'login' && (
          <div className="pt-4 border-t border-[#E8DCC2]/60 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#634E3F]">
                👥 Masuk Cepat sebagai Akun Demo:
              </p>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-[10px] text-[#B4532A] font-bold hover:underline"
                >
                  Keluar Akun
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoUsers.map((u) => {
                const isCurrent = customer?.id === u.id || customer?.phone === u.phone;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchCustomer(u);
                      router.push('/member');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-[#3E4F30] bg-[#E4EADF] font-bold text-[#3E4F30] ring-1 ring-[#3E4F30]'
                        : 'border-[#E8DCC2] bg-[#FDF7EE] hover:bg-[#F8EECF] text-[#2B2625]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{u.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-[#D5C7B0]">
                        {u.tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#634E3F] mt-0.5 font-mono">
                      {u.phone} • {u.pointsBalance} Pts
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-12 text-center text-xs text-[#634E3F]">
          Memuat formulir otentikasi...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
