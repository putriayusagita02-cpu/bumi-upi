import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'olive' | 'bordered';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<
    'default' | 'surface' | 'olive' | 'bordered',
    { bg: string; border: string; text?: string }
  > = {
    default: {
      bg: '#F5EEDC',
      border: '#E8DCC2',
      text: '#2B2625',
    },
    surface: {
      bg: '#FBF7EE',
      border: '#E8DCC2',
      text: '#2B2625',
    },
    olive: {
      bg: '#3E4F30',
      border: '#344328',
      text: '#F5EEDC',
    },
    bordered: {
      bg: '#FFFFFF',
      border: '#E8DCC2',
      text: '#2B2625',
    },
  };

  const selected = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.default;

  return (
    <div
      className={`rounded-[1.25rem] border shadow-sm transition-all duration-200 overflow-hidden ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      style={{
        backgroundColor: selected.bg,
        borderColor: selected.border,
        color: selected.text,
        boxShadow: '0 4px 20px -2px rgba(59, 42, 30, 0.08), 0 2px 6px -1px rgba(59, 42, 30, 0.04)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-5 pb-3 flex items-start justify-between gap-4 border-b border-[#E8DCC2]/60 ${className}`}
      {...props}
    >
      <div className="space-y-1 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  as: Component = 'h3',
  className = '',
  style,
  ...props
}) => {
  return (
    <Component
      className={`font-serif text-lg font-semibold tracking-tight text-[#2B2625] ${className}`}
      style={{
        fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)',
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

CardTitle.displayName = 'CardTitle';

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-[#634E3F] leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

CardDescription.displayName = 'CardDescription';

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-5 pt-3 border-t border-[#E8DCC2]/60 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
