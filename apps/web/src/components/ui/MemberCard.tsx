import React from 'react';

export type MembershipTier = 'Tamu' | 'Sahabat' | 'Keluarga';

export interface MemberCardProps {
  name: string;
  memberId?: string;
  phone?: string;
  tier?: MembershipTier;
  points?: number;
  qrValue?: string;
  onScanClick?: () => void;
  className?: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  name,
  memberId = 'BUMI-CUST-8899',
  phone = '0812-3456-7890',
  tier = 'Sahabat',
  points = 142,
  qrValue = 'BUMI-CUST-8899-QR',
  onScanClick,
  className = '',
}) => {
  const tierConfig: Record<
    MembershipTier,
    {
      label: string;
      bgGradient: string;
      textColor: string;
      badgeBg: string;
      badgeText: string;
      accentColor: string;
      nextTier?: { name: string; target: number };
    }
  > = {
    Tamu: {
      label: 'Tamu',
      bgGradient: 'linear-gradient(135deg, #3E4F30 0%, #2A3620 100%)',
      textColor: '#F5EEDC',
      badgeBg: '#A4BC98',
      badgeText: '#171D11',
      accentColor: '#C7D4BF',
      nextTier: { name: 'Sahabat', target: 100 },
    },
    Sahabat: {
      label: 'Sahabat',
      bgGradient: 'linear-gradient(135deg, #B4532A 0%, #93401E 100%)',
      textColor: '#FFFFFF',
      badgeBg: '#D4A24C',
      badgeText: '#2B2625',
      accentColor: '#E2BA70',
      nextTier: { name: 'Keluarga', target: 300 },
    },
    Keluarga: {
      label: 'Keluarga',
      bgGradient: 'linear-gradient(135deg, #2B2625 0%, #171D11 100%)',
      textColor: '#F5EEDC',
      badgeBg: '#D4A24C',
      badgeText: '#2B2625',
      accentColor: '#D4A24C',
    },
  };

  const safeTier: MembershipTier = (tier && tier in tierConfig) ? tier : 'Sahabat';
  const config = tierConfig[safeTier];
  const safePoints = typeof points === 'number' && !Number.isNaN(points) ? points : 0;

  let progressPercentage = 100;
  let progressText = 'Tier Tertinggi';
  if (config.nextTier) {
    const currentBase = safeTier === 'Sahabat' ? 100 : 0;
    const range = config.nextTier.target - currentBase;
    const progress = Math.max(0, Math.min(range, safePoints - currentBase));
    progressPercentage = Math.round((progress / range) * 100);
    const remaining = Math.max(0, config.nextTier.target - safePoints);
    progressText = `${remaining} poin lagi menuju ${config.nextTier.name}`;
  }

  return (
    <div
      className={`relative w-full max-w-md rounded-[1.5rem] p-6 text-white shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.01] ${className}`}
      style={{
        background: config.bgGradient,
        boxShadow: '0 20px 35px -10px rgba(43, 38, 37, 0.4), 0 8px 16px -4px rgba(43, 38, 37, 0.2)',
        border: '1px solid rgba(245, 238, 220, 0.15)',
      }}
    >
      <div
        className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-10 pointer-events-none"
        style={{ border: '16px solid #FFFFFF' }}
      />
      <div
        className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ border: '24px solid #FFFFFF' }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span
              className="font-serif text-sm font-bold tracking-widest uppercase"
              style={{
                fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)',
                color: config.textColor,
              }}
            >
              Rumah Tamah Bumi Upi
            </span>
          </div>
          <p className="text-[11px] opacity-80 pl-7 tracking-wider">Kartu Tamu Setia — Garut Heritage</p>
        </div>

        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm shrink-0"
          style={{
            backgroundColor: config.badgeBg,
            color: config.badgeText,
          }}
        >
          {config.label}
        </span>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-3 gap-4 items-center">
        <div className="col-span-2 space-y-1">
          <p className="text-[11px] opacity-75 uppercase tracking-wider">Nama Anggota</p>
          <h2
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight truncate"
            style={{
              fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)',
              color: config.textColor,
            }}
          >
            {name || 'Tamu Setia'}
          </h2>
          <p className="font-mono text-xs opacity-85 pt-1">
            {phone} • {memberId}
          </p>
        </div>

        <div
          className="col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-md cursor-pointer hover:opacity-95 transition-opacity"
          onClick={onScanClick}
          title="Klik untuk memindai QR code kasir"
        >
          <svg
            className="w-16 h-16 text-[#2B2625]"
            viewBox="0 0 100 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="10" y="10" width="24" height="24" rx="2" fill="#2B2625" />
            <rect x="15" y="15" width="14" height="14" fill="#FFFFFF" />
            <rect x="18" y="18" width="8" height="8" fill="#2B2625" />

            <rect x="66" y="10" width="24" height="24" rx="2" fill="#2B2625" />
            <rect x="71" y="15" width="14" height="14" fill="#FFFFFF" />
            <rect x="74" y="18" width="8" height="8" fill="#2B2625" />

            <rect x="10" y="66" width="24" height="24" rx="2" fill="#2B2625" />
            <rect x="15" y="71" width="14" height="14" fill="#FFFFFF" />
            <rect x="18" y="74" width="8" height="8" fill="#2B2625" />

            <rect x="42" y="14" width="8" height="8" rx="1" fill="#2B2625" />
            <rect x="52" y="24" width="6" height="6" fill="#2B2625" />
            <rect x="42" y="38" width="10" height="10" rx="1" fill="#2B2625" />
            <rect x="14" y="44" width="8" height="8" fill="#2B2625" />
            <rect x="28" y="48" width="6" height="6" fill="#2B2625" />
            <rect x="58" y="48" width="8" height="8" fill="#2B2625" />
            <rect x="72" y="42" width="12" height="6" fill="#2B2625" />
            <rect x="42" y="66" width="8" height="8" rx="1" fill="#2B2625" />
            <rect x="56" y="66" width="14" height="8" fill="#2B2625" />
            <rect x="76" y="66" width="8" height="16" fill="#2B2625" />
            <rect x="52" y="78" width="16" height="8" fill="#2B2625" />
          </svg>
          <span className="text-[9px] font-mono font-bold text-[#2B2625] pt-1 uppercase">Scan POS</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[11px] opacity-75 uppercase tracking-wider">Saldo Poin</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight" style={{ color: config.accentColor }}>
                {safePoints.toLocaleString('id-ID')}
              </span>
              <span className="text-xs opacity-80 font-medium">Poin</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] opacity-90 font-medium">{progressText}</span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: config.accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
