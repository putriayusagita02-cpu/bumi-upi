/**
 * Design Tokens — Rumah Tamah Bumi Upi (Garut Heritage)
 * Authentic "Rumah Nenek Sunda" Palette, Typography, and Aesthetics
 */

export const colors = {
  // Brand Core Colors
  olive: {
    DEFAULT: '#3E4F30', // Official Brand Green & Primary Actions
    50: '#F4F6F2',
    100: '#E4EADF',
    200: '#C7D4BF',
    300: '#A4BC98',
    400: '#6C885B',
    500: '#3E4F30',
    600: '#344328',
    700: '#2A3620',
    800: '#212A19',
    900: '#171D11',
  },
  krem: {
    DEFAULT: '#F5EEDC', // Authentic Paper/Surface Background
    surface: '#FBF7EE', // Clean Card Surface
    border: '#E8DCC2',  // Vintage Divider & Border
    dark: '#E0D4BA',
    light: '#FCF9F2',
  },
  terakota: {
    DEFAULT: '#B4532A', // Accent, CTA, Primary Action Highlights
    light: '#CE6C41',
    dark: '#93401E',
    hover: '#9E4520',
    50: '#FDF4F0',
    100: '#FCE7DF',
  },
  mustard: {
    DEFAULT: '#D4A24C', // Poin, Loyalty Badges & Warm Accent
    light: '#E2BA70',
    dark: '#B88632',
    50: '#FBF7EE',
    100: '#F8EECF',
  },
  kopi: {
    DEFAULT: '#2B2625', // Deep Coffee Black for High-Contrast Headings
    light: '#3B2A1E',   // Warm Coffee Brown for Primary Body Text
    muted: '#634E3F',   // Muted Timber for Descriptions & Secondary Text
    subtle: '#8C7767',  // Placeholder & Subtle Text
  },
  sage: {
    DEFAULT: '#8A8F5F', // Natural Soft Green for Positive Badges
    light: '#A5AA7E',
    dark: '#6E7247',
    50: '#F5F6F0',
  },
  // Semantic UI Helpers
  status: {
    success: '#3E4F30',
    warning: '#D4A24C',
    error: '#B4532A',
    info: '#5B7C88',
  },
  // Membership Tier Brand Colors
  tiers: {
    tamu: {
      bg: '#F5EEDC',
      text: '#634E3F',
      border: '#E0D4BA',
      badge: '#A4BC98',
    },
    sahabat: {
      bg: '#FBF7EE',
      text: '#93401E',
      border: '#D4A24C',
      badge: '#D4A24C',
    },
    keluarga: {
      bg: '#3E4F30',
      text: '#F5EEDC',
      border: '#B4532A',
      badge: '#CE6C41',
    },
  },
} as const;

export const typography = {
  fonts: {
    serif: 'var(--font-fraunces, "Fraunces", Georgia, serif)',
    sans: 'var(--font-jakarta, "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    handwriting: 'var(--font-caveat, "Caveat", "Brush Script MT", cursive)',
  },
  scale: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
} as const;

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  vintage: '1.25rem', // 20px - Warm rounded corners
  'vintage-asym': '1.75rem 0.5rem 1.75rem 0.5rem', // Asymmetric vintage badge
  full: '9999px',
} as const;

export const shadows = {
  warm: '0 4px 20px -2px rgba(59, 42, 30, 0.08), 0 2px 6px -1px rgba(59, 42, 30, 0.04)',
  'warm-lg': '0 10px 30px -4px rgba(59, 42, 30, 0.12), 0 4px 12px -2px rgba(59, 42, 30, 0.06)',
  'warm-sm': '0 2px 8px -1px rgba(59, 42, 30, 0.06)',
} as const;

export const tokens = {
  colors,
  typography,
  borderRadius,
  shadows,
};

function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as any)[prop];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

deepFreeze(colors);
deepFreeze(typography);
deepFreeze(borderRadius);
deepFreeze(shadows);
deepFreeze(tokens);

export default tokens;
