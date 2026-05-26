import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, max, color = '#00D4FF', className, showLabel, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = max > 0 && value > max;

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#A3A3A3] mb-1.5">
          <span>{label}</span>
          <span className="font-stat">{value} / {max}</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#F59E0B' : color,
            boxShadow: pct > 0 ? `0 0 6px ${over ? '#F59E0B' : color}60` : undefined,
          }}
        />
      </div>
    </div>
  );
}
