'use client';

import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { useDailyLog } from '@/hooks/useDailyLog';
import { todayISO, formatDisplayDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Dumbbell, Wind, Footprints, Flame, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { DayPlan } from '@/types';

const SESSION_COLORS = {
  gym: { bg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/20', text: 'text-[#00D4FF]', icon: Dumbbell },
  cardio: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', text: 'text-[#22C55E]', icon: Wind },
  rest: { bg: 'bg-[#525252]/10', border: 'border-[#525252]/20', text: 'text-[#A3A3A3]', icon: Footprints },
};

function DayCard({ day, isToday }: { day: DayPlan; isToday: boolean }) {
  const { log } = useDailyLog(day.dateISO);
  const style = SESSION_COLORS[day.sessionType];
  const Icon = style.icon;
  const isPast = day.dateISO < todayISO();
  const gymDone = log?.gymDone;
  const cardioDone = log?.cardioDone;
  const sessionDone = day.sessionType === 'gym' ? gymDone : day.sessionType === 'cardio' ? cardioDone : true;

  return (
    <Card className={clsx('relative transition-all', isToday && 'ring-1 ring-[#00D4FF]/40')}>
      {isToday && (
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
      )}

      <div className="flex items-start gap-3">
        <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', style.bg, style.border)}>
          <Icon size={16} className={style.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-[#525252] uppercase tracking-wider">
              {formatDisplayDate(day.dateISO)}
            </span>
            {isToday && (
              <span className="text-[10px] font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded-full">
                TODAY
              </span>
            )}
            {isPast && sessionDone && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/20">
                <Check size={10} className="text-[#22C55E]" />
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#F5F5F5] truncate">{day.sessionLabel}</p>

          <div className="flex gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-[#A3A3A3]">
              <Flame size={11} className="text-[#F59E0B]" />
              {day.calorieTarget} kcal
            </span>
            {day.cardioMinutes > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#A3A3A3]">
                <Wind size={11} className="text-[#22C55E]" />
                {day.cardioMinutes}min
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#A3A3A3]">
              <Footprints size={11} />
              {(day.stepTarget / 1000).toFixed(0)}k steps
            </span>
          </div>
        </div>

        <ChevronRight size={14} className="text-[#525252] mt-1 shrink-0" />
      </div>
    </Card>
  );
}

export default function PlanPage() {
  const { plan } = useWeeklyPlan();
  const today = todayISO();

  const gymDays = plan.days.filter((d) => d.sessionType === 'gym').length;
  const cardioDays = plan.days.filter((d) => d.sessionType === 'cardio').length;
  const avgCals = Math.round(plan.days.reduce((s, d) => s + d.calorieTarget, 0) / 7);

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F5F5F5]">Weekly Plan</h1>
        <p className="text-sm text-[#525252] mt-0.5">Your training & nutrition schedule</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Gym Sessions', value: gymDays, unit: 'days', color: 'text-[#00D4FF]' },
          { label: 'Cardio', value: cardioDays, unit: 'days', color: 'text-[#22C55E]' },
          { label: 'Avg Calories', value: avgCals, unit: 'kcal', color: 'text-[#F59E0B]' },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <p className={clsx('font-stat text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-[10px] text-[#525252] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Day cards */}
      <div className="flex flex-col gap-3">
        {plan.days.map((day) => (
          <Link key={day.dateISO} href={`/plan/${day.dateISO}`} className="block">
            <DayCard day={day} isToday={day.dateISO === today} />
          </Link>
        ))}
      </div>

      {/* Nutrition targets */}
      <Card className="mt-5">
        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Nutrition Targets</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          {[
            { label: 'Protein (daily)', value: '160g', color: 'text-[#00D4FF]' },
            { label: 'Training day cals', value: '2,300 kcal', color: 'text-[#F59E0B]' },
            { label: 'Rest day cals', value: '2,000 kcal', color: 'text-[#F59E0B]' },
            { label: 'Steps target', value: '10,000+', color: 'text-[#22C55E]' },
          ].map((t) => (
            <div key={t.label}>
              <p className="text-xs text-[#525252] mb-0.5">{t.label}</p>
              <p className={clsx('font-stat font-semibold', t.color)}>{t.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
