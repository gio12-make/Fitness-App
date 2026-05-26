import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow = true }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4 md:p-5',
        glow && 'card-glow',
        className
      )}
    >
      {children}
    </div>
  );
}
