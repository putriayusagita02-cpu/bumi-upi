import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'mustard';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      style,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses =
      'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none shadow-sm';

    // Variant classes & inline styles for guarantee
    const variantStyles: Record<
      ButtonVariant,
      { className: string; style: React.CSSProperties }
    > = {
      primary: {
        className: 'text-[#F5EEDC] focus:ring-[#3E4F30] hover:brightness-110',
        style: {
          backgroundColor: '#3E4F30',
          color: '#F5EEDC',
        },
      },
      secondary: {
        className: 'text-white focus:ring-[#B4532A] hover:brightness-110',
        style: {
          backgroundColor: '#B4532A',
          color: '#FFFFFF',
        },
      },
      outline: {
        className: 'border-2 focus:ring-[#3E4F30] hover:bg-[#F4F6F2]',
        style: {
          borderColor: '#3E4F30',
          color: '#3E4F30',
          backgroundColor: 'transparent',
        },
      },
      ghost: {
        className: 'focus:ring-[#3E4F30] hover:bg-[#F4F6F2]',
        style: {
          backgroundColor: 'transparent',
          color: '#3B2A1E',
        },
      },
      mustard: {
        className: 'focus:ring-[#D4A24C] hover:brightness-105',
        style: {
          backgroundColor: '#D4A24C',
          color: '#2B2625',
          fontWeight: 600,
        },
      },
    };

    // Size classes
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-[1.25rem] gap-2',
      lg: 'px-6 py-3.5 text-base rounded-[1.25rem] gap-2.5 font-semibold',
    };

    const currentVariant = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.primary;
    const currentSize = (size && size in sizeClasses) ? sizeClasses[size] : sizeClasses.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${currentVariant.className} ${currentSize} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        style={{
          ...currentVariant.style,
          ...style,
        }}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
