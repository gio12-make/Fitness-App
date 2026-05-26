import { clsx } from 'clsx';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          'h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#525252]',
          'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 transition-colors',
          error && 'border-[#EF4444]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          'w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#525252] resize-none',
          'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 transition-colors',
          className
        )}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = 'Textarea';
