import React from 'react';

export type BadgeVariant =
  | 'olive'
  | 'terakota'
  | 'mustard'
  | 'sage'
  | 'kopi'
  | 'tier-tamu'
  | 'tier-sahabat'
  | 'tier-keluarga'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'olive',
  size = 'md',
  dot = false,
  icon,
  className = '',
  style,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center font-sans font-medium transition-colors select-none tracking-wide';

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[11px] rounded-full gap-1',
    md: 'px-3 py-1 text-xs rounded-full gap-1.5',
  };

  const variantStyles: Record<
    BadgeVariant,
    { bg: string; text: string; border?: string; dotColor: string }
  > = {
    olive: {
      bg: '#E4EADF',
      text: '#3E4F30',
      border: '#C7D4BF',
      dotColor: '#3E4F30',
    },
    terakota: {
      bg: '#FCE7DF',
      text: '#B4532A',
      border: '#F6C1AF',
      dotColor: '#B4532A',
    },
    mustard: {
      bg: '#FDF4DF',
      text: '#B88632',
      border: '#F0D49C',
      dotColor: '#D4A24C',
    },
    sage: {
      bg: '#F2F4EB',
      text: '#586036',
      border: '#D8DEC4',
      dotColor: '#8A8F5F',
    },
    kopi: {
      bg: '#F5EEDC',
      text: '#2B2625',
      border: '#E0D4BA',
      dotColor: '#3B2A1E',
    },
    'tier-tamu': {
      bg: '#F5EEDC',
      text: '#634E3F',
      border: '#E0D4BA',
      dotColor: '#8C7767',
    },
    'tier-sahabat': {
      bg: '#FFF8E8',
      text: '#93401E',
      border: '#D4A24C',
      dotColor: '#D4A24C',
    },
    'tier-keluarga': {
      bg: '#3E4F30',
      text: '#F5EEDC',
      border: '#B4532A',
      dotColor: '#CE6C41',
    },
    success: {
      bg: '#E4EADF',
      text: '#2A3620',
      border: '#C7D4BF',
      dotColor: '#3E4F30',
    },
    warning: {
      bg: '#FDF4DF',
      text: '#946618',
      border: '#F0D49C',
      dotColor: '#D4A24C',
    },
    error: {
      bg: '#FCE7DF',
      text: '#93401E',
      border: '#F6C1AF',
      dotColor: '#B4532A',
    },
    info: {
      bg: '#E6EFF4',
      text: '#2C5567',
      border: '#BFD7E3',
      dotColor: '#5B7C88',
    },
  };

  const currentVariant = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.olive;
  const currentSize = (size && size in sizeClasses) ? sizeClasses[size] : sizeClasses.md;

  return (
    <span
      className={`${baseClasses} ${currentSize} ${className}`}
      style={{
        backgroundColor: currentVariant.bg,
        color: currentVariant.text,
        border: currentVariant.border ? `1px solid ${currentVariant.border}` : 'none',
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: currentVariant.dotColor }}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

Badge.displayName = 'Badge';
