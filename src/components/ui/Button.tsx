import { type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
  danger: 'bg-status-cancelled text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success: 'bg-status-available text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
  ghost: 'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  fullWidth,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        touch-target inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
