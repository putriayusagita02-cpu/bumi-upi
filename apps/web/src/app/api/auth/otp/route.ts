import { NextRequest, NextResponse } from 'next/server';
import { orderEngine, verifyOtp, getPhoneVariations } from '../../../../lib/dbBridge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, code, name, email, mode } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = String(phone).replace(/[^\d+]/g, '');

    // Format into international standard (628xxx) for real WhatsApp link
    let waTargetPhone = cleanPhone.replace(/^\+/, '');
    if (waTargetPhone.startsWith('0')) {
      waTargetPhone = '62' + waTargetPhone.slice(1);
    } else if (waTargetPhone.startsWith('8')) {
      waTargetPhone = '62' + waTargetPhone;
    }

    if (action === 'request') {
      const otpRes = orderEngine.generateOtp(cleanPhone);
      const otpCode = otpRes.demoOtp;

      // Sync across all phone variations into @bumi-upi/db mockStore if present
      try {
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && dbPkg.mockStore && dbPkg.mockStore.otpStore) {
          const variations = getPhoneVariations(cleanPhone);
          const expiresAt = Date.now() + 10 * 60 * 1000;
          for (const v of variations) {
            dbPkg.mockStore.otpStore.set(v, {
              code: otpCode,
              expiresAt,
              attempts: 0,
              verified: false,
            });
          }
        }
      } catch (syncErr) {
        console.error('[OTP Sync] Notice:', syncErr);
      }

      const greetingName = name ? String(name).trim() : 'Sobat Bumi';
      const isRegister = mode === 'register';

      // Official Bumi Upi WhatsApp Number (Garut Heritage CS & Bot)
      const adminWa = process.env.ADMIN_WHATSAPP_NUMBER || '6281223344550';

      // Real pre-filled WhatsApp message sent to Official Bumi Upi CS
      const officialWaMessage = isRegister
        ? `🌿 *PENDAFTARAN ANGGOTA RUMAH TAMAH BUMI UPI*\n\nSampurasun Admin Bumi Upi,\nSaya ingin memverifikasi pendaftaran akun baru:\n👤 *Nama:* ${greetingName}\n📧 *Email:* ${email || '-'}\n📱 *Nomor WA:* +${waTargetPhone}\n🔑 *Kode OTP:* ${otpCode}\n\nMohon bantu aktivasi keanggotaan Keluarga Bumi saya. Hatur nuhun!`
        : `🌿 *VERIFIKASI MASUK RUMAH TAMAH BUMI UPI*\n\nSampurasun Admin Bumi Upi,\nSaya ingin masuk ke akun saya:\n📱 *Nomor WA:* +${waTargetPhone}\n🔑 *Kode OTP:* ${otpCode}\n\nHatur nuhun!`;

      // Official WhatsApp deep links targeting Bumi Upi Customer Service
      const whatsappUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(officialWaMessage)}`;
      const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${adminWa}&text=${encodeURIComponent(officialWaMessage)}`;
      const whatsappCsUrl = whatsappUrl;

      // If Fonnte or external WhatsApp Gateway is configured, attempt real background dispatch
      if (process.env.FONNTE_TOKEN) {
        try {
          await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
              Authorization: process.env.FONNTE_TOKEN,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              target: waTargetPhone,
              message: officialWaMessage,
            }),
          });
        } catch (gatewayErr) {
          console.error('[WhatsApp Gateway] Error sending to Fonnte:', gatewayErr);
        }
      }

      return NextResponse.json({
        success: true,
        phone: cleanPhone,
        targetPhone: waTargetPhone,
        formattedPhone: `+${waTargetPhone}`,
        demoOtp: otpCode,
        whatsappUrl,
        whatsappWebUrl,
        whatsappCsUrl,
        waMessage: officialWaMessage,
        banner: otpRes.banner,
        mode: mode || 'login',
        name,
        email,
        message: `Kode OTP berhasil disiapkan untuk nomor WhatsApp +${waTargetPhone}.`,
      });
    }

    if (action === 'verify') {
      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Kode OTP 6-angka wajib diisi' },
          { status: 400 }
        );
      }
      const verifyRes = await verifyOtp(cleanPhone, code, name, email);
      if (!verifyRes.success) {
        return NextResponse.json(
          { success: false, error: verifyRes.error || 'Verifikasi OTP gagal' },
          { status: 400 }
        );
      }

      // Build customer profile from real registration data
      const custName = name
        ? String(name).trim()
        : cleanPhone.includes('081234567890')
        ? 'Dimas Kurniawan'
        : `Member ${cleanPhone.slice(-4)}`;
      const custEmail = email
        ? String(email).trim()
        : `${cleanPhone.replace(/\D/g, '')}@bumiupi.id`;

      const customerProfile = {
        id: `cust-${Date.now()}`,
        name: custName,
        email: custEmail,
        phone: cleanPhone,
        tier: 'Tamu',
        pointsBalance: 50, // 50 bonus welcome points for registration
        cumulativePoints: 50,
        memberId: `BU-${Date.now().toString().slice(-6)}`,
        qrValue: `BUMI-UPI-MEMBER-${cleanPhone}`,
        birthDate: '1998-05-15',
        favoritePreferences: 'Nasi Liwet Komplit, Es Cincau Jadoel',
      };

      return NextResponse.json({
        success: true,
        customer: customerProfile,
        message: 'Verifikasi WhatsApp OTP berhasil',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenal (request / verify)' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
