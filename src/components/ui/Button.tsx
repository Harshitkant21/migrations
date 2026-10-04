// src/components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex flex-row items-center justify-center whitespace-nowrap font-medium rounded-lg transition-all focus:outline-none select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-xs border border-transparent',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 shadow-xs',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-transparent',
    dark: 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 border border-slate-700 shadow-xs'
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-semibold leading-none',
    md: 'text-xs px-4 py-2 gap-2 font-bold leading-none',
    lg: 'text-xs px-5 py-2.5 gap-2 font-bold leading-none'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none">{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};

