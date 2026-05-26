import { clsx } from 'clsx';

interface StatBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  default: 'text-[#F5F5F5]',
  accent: 'text-[#00D4FF]',
  success: 'text-[#22C55E]',
  warning: 'text-[#F59E0B]',
  danger: 'text-[#EF4444]',
};

export function StatBadge({ label, value, unit, color = 'default' }: StatBadgeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#525252] uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={clsx('font-stat text-2xl font-semibold', colorMap[color])}>{value}</span>
        {unit && <span className="text-xs text-[#A3A3A3]">{unit}</span>}
      </div>
    </div>
  );
}
