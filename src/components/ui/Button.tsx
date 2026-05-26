import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-[#00D4FF] text-[#0A0A0A] hover:bg-[#0099BB] active:scale-95': variant === 'primary',
          'border border-[#2A2A2A] text-[#A3A3A3] hover:border-[#3A3A3A] hover:text-[#F5F5F5] bg-transparent': variant === 'ghost',
          'bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-95': variant === 'danger',
          'bg-[#22C55E] text-[#0A0A0A] hover:bg-[#16A34A] active:scale-95': variant === 'success',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
