'use client';

import { useState, useMemo } from 'react';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { useAdherence } from '@/hooks/useAdherence';
import { useWeeklyLogs } from '@/hooks/useWeeklyLogs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { daysUntil, todayISO, getWeekDates, getWeekStartISO, formatShortDate } from '@/lib/dateUtils';
import { USER_PROFILE } from '@/lib/constants';
import { getTDEE, getNetCalories } from '@/lib/tdee';
import { useProfile } from '@/hooks/useProfile';
import { Dumbbell, Wind, Footprints, Check, Zap } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Ring — correct fill on first render, CSS entrance animation ──────────────
function Ring({
  percent,
  size = 120,
  stroke = 8,
  color,
  trackColor = '#1C1C1E',
  children,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(percent, 0), 100) / 100) * circ;
  const cx = size / 2;
  const id = `glow-${size}-${color.replace('#', '')}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <svg width={size} height={size} className="-rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <filter id={id}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {/* Glow */}
        {percent > 1 && (
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke + 4}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ opacity: 0.18, filter: `blur(5px)` }}
          />
        )}
        {/* Arc */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Fade-in wrapper (CSS-only so SSR + screenshots see content) ─────────────
function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={clsx('animate-enter', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      'rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden',
      className
    )}>
      {children}
    </div>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">{children}</p>;
}

// ─── Weight Sparkline (SVG gradient fill) ─────────────────────────────────────
function WeightSparkline({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) return (
    <div className="relative h-20 overflow-hidden">
      {/* Placeholder ghost chart */}
      <svg viewBox="0 0 400 60" className="w-full opacity-20" preserveAspectRatio="none" style={{ height: 60 }}>
        <defs>
          <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,40 C50,35 80,20 120,22 C160,24 190,38 240,30 C280,23 320,15 400,18 L400,60 L0,60Z" fill="url(#ghostGrad)" />
        <path d="M0,40 C50,35 80,20 120,22 C160,24 190,38 240,30 C280,23 320,15 400,18" fill="none" stroke="#0A84FF" strokeWidth="1.5" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <p className="text-xs font-semibold text-[#44444A]">No data yet</p>
        <p className="text-[10px] text-[#2A2A2F] font-mono">Log weight on the Progress page</p>
      </div>
    </div>
  );

  const W = 400; const H = 80; const pad = { t: 8, b: 20, l: 4, r: 4 };
  const vals = data.map(d => d.weight);
  const min = Math.min(...vals) - 0.3;
  const max = Math.max(...vals) + 0.3;
  const range = max - min || 1;
  const toX = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const toY = (v: number) => pad.t + (1 - (v - min) / range) * (H - pad.t - pad.b);

  const pts = data.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(' ');
  const areaPath = `M ${toX(0)},${toY(data[0].weight)} ` +
    data.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.weight)}`).join(' ') +
    ` L ${toX(data.length - 1)},${H - pad.b} L ${toX(0)},${H - pad.b} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const delta = +(last.weight - first.weight).toFixed(1);
  const isDown = delta <= 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold text-[#F5F5F7]">{last.weight}</span>
          <span className="text-sm text-[#6B6B75]">kg</span>
        </div>
        <span className={clsx('font-mono text-sm font-semibold', isDown ? 'text-[#30D158]' : 'text-[#FF453A]')}>
          {delta > 0 ? '+' : ''}{delta} kg
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDown ? '#30D158' : '#FF453A'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isDown ? '#30D158' : '#FF453A'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wGrad)" />
        <polyline points={pts} fill="none" stroke={isDown ? '#30D158' : '#FF453A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Last point dot */}
        <circle cx={toX(data.length - 1)} cy={toY(last.weight)} r="3" fill={isDown ? '#30D158' : '#FF453A'} />
        {/* X labels */}
        <text x={toX(0)} y={H} textAnchor="start" fill="#44444A" fontSize="9" fontFamily="ui-monospace">{formatShortDate(first.date)}</text>
        <text x={toX(data.length - 1)} y={H} textAnchor="end" fill="#44444A" fontSize="9" fontFamily="ui-monospace">{formatShortDate(last.date)}</text>
      </svg>
    </div>
  );
}

// ─── 7-day training strip ─────────────────────────────────────────────────────
function TrainingStrip({
  days,
  logs,
}: {
  days: ReturnType<typeof useWeeklyPlan>['plan']['days'];
  logs: (ReturnType<typeof useDailyLog>['log'] | null)[];
}) {
  const today = todayISO();
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div className="flex gap-1.5">
      {days.map((d, i) => {
        const log = logs[i];
        const isToday = d.dateISO === today;
        const isPast = d.dateISO < today;
        const done = d.sessionType === 'gym' ? log?.gymDone : d.sessionType === 'cardio' ? log?.cardioDone : true;
        const col = d.sessionType === 'gym' ? '#0A84FF' : d.sessionType === 'cardio' ? '#30D158' : '#3A3A3F';

        return (
          <div key={d.dateISO} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-semibold text-[#44444A] uppercase">{DAYS[i]}</span>
            <div
              className="w-full h-1.5 rounded-full"
              style={{
                backgroundColor: isToday ? col : isPast && done ? col : isPast ? '#2A2A2F' : '#1C1C1E',
                outline: isToday ? `1px solid ${col}` : undefined,
                outlineOffset: isToday ? '2px' : undefined,
              }}
            />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: isToday ? `${col}20` : 'transparent', border: isToday ? `1px solid ${col}40` : '1px solid transparent' }}
            >
              {d.sessionType === 'gym' && <Dumbbell size={10} style={{ color: isPast && done ? col : isToday ? col : '#44444A' }} />}
              {d.sessionType === 'cardio' && <Wind size={10} style={{ color: isPast && done ? col : isToday ? col : '#44444A' }} />}
              {d.sessionType === 'rest' && <Footprints size={10} className="text-[#44444A]" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Adherence history dots ───────────────────────────────────────────────────
function AdherenceDots({ history }: { history: { score: number }[] }) {
  const last14 = history.slice(-14);
  return (
    <div className="flex gap-1 flex-wrap">
      {Array.from({ length: 14 }).map((_, i) => {
        const d = last14[i];
        const s = d?.score ?? -1;
        const bg = s >= 80 ? '#30D158' : s >= 60 ? '#FFD60A' : s >= 0 ? '#FF453A' : '#1C1C1E';
        return (
          <div key={i} className="h-2 w-2 rounded-full transition-colors duration-300" style={{ backgroundColor: bg }} />
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { log, totalMacros, setGymDone, setCardioDone, setSteps } = useDailyLog();
  const { plan, todayPlan } = useWeeklyPlan();
  const { profile } = useProfile();
  const adherence = useAdherence();
  const weekDates = useMemo(() => getWeekDates(getWeekStartISO()), []);
  const weekLogs = useWeeklyLogs(weekDates);

  const startWeight = profile?.startWeight ?? USER_PROFILE.startWeight;
  const [stepsVal, setStepsVal] = useState(log.stepsCount?.toString() ?? '');

  // Weight history from weekly logs (last 14 days for chart)
  const last14 = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const last14Logs = useWeeklyLogs(last14);
  const weightHistory = useMemo(() =>
    last14.map((date, i) => ({ date, weight: last14Logs[i]?.weightKg ?? null }))
      .filter((d): d is { date: string; weight: number } => d.weight !== null),
    [last14, last14Logs]
  );

  const deadline = profile?.deadline ?? USER_PROFILE.deadline;
  const startDate = profile?.startDate ?? USER_PROFILE.startDate;
  const days = daysUntil(deadline);
  const totalChallengeDays = daysUntil(startDate) + days;
  const challengePercent = totalChallengeDays > 0
    ? Math.round(((totalChallengeDays - days) / totalChallengeDays) * 100)
    : 0;

  const proteinTarget = profile?.proteinTargetG ?? 160;
  const calTarget = todayPlan?.calorieTarget ?? (profile?.calorieRestDay ?? 2200);
  const stepTarget = todayPlan?.stepTarget ?? (profile?.stepTarget ?? 10000);
  const calPct = Math.round((totalMacros.calories / calTarget) * 100);
  const proteinPct = Math.round((totalMacros.proteinG / proteinTarget) * 100);
  const stepsPct = log.stepsCount ? Math.round((log.stepsCount / stepTarget) * 100) : 0;

  const sessionType = todayPlan?.sessionType ?? 'rest';
  const tdee = getTDEE(sessionType, profile);
  const netCals = totalMacros.calories > 0 ? getNetCalories(totalMacros.calories, sessionType, profile) : null;

  const adherenceColor = adherence.last7DaysAvg === 0 ? '#2A2A2F' : adherence.last7DaysAvg >= 80 ? '#30D158' : adherence.last7DaysAvg >= 55 ? '#FFD60A' : '#FF453A';

  const gymDoneCount = weekLogs.filter((l, i) => l?.gymDone && plan.days[i]?.sessionType === 'gym').length;
  const cardioDoneCount = weekLogs.filter((l, i) => l?.cardioDone && plan.days[i]?.sessionType === 'cardio').length;

  return (
    <div className="min-h-screen bg-[#080808] px-4 pt-6 pb-24 lg:pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
      {/* Header */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">Performance</h1>
            <p className="text-sm text-[#44444A] mt-0.5 font-mono">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20">
              <Zap size={14} className="text-[#0A84FF]" />
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">

        {/* ── Countdown hero ──────────────────────────────────────── */}
        <FadeIn delay={60} className="lg:col-span-2">
          <Card>
            <div className="relative overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -top-10 left-1/4 w-80 h-40 rounded-full bg-[#0A84FF]/10 blur-3xl pointer-events-none" />
              <div className="absolute -top-10 right-1/4 w-60 h-40 rounded-full bg-[#5E5CE6]/8 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-8 p-6">
                {/* Big ring */}
                <div className="shrink-0">
                  <Ring percent={challengePercent} size={108} stroke={7} color="#0A84FF">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[28px] font-bold text-[#F5F5F7] leading-none">{days}</span>
                      <span className="text-[9px] text-[#44444A] font-mono uppercase tracking-wider mt-0.5">days</span>
                    </div>
                  </Ring>
                </div>

                {/* Text + bar */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-1">Challenge active</p>
                  <p className="text-[28px] font-semibold text-[#F5F5F7] tracking-tight leading-tight">Abs by August</p>
                  <p className="text-sm text-[#6B6B75] font-mono mt-0.5">Deadline: 1 Aug 2026</p>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-mono text-[#44444A] mb-2">
                      <span>Start — 24 May</span>
                      <span className="text-[#0A84FF] font-semibold">{challengePercent}% complete</span>
                      <span>1 Aug</span>
                    </div>
                    <div className="h-[3px] w-full rounded-full bg-[#1C1C1E] overflow-hidden">
                      <BarFill percent={challengePercent} color="#0A84FF" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ── Calories ring ─────────────────────────────────────── */}
        <FadeIn delay={120}>
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Label>Calories today</Label>
                <span className="text-[10px] font-mono text-[#44444A]">target {calTarget}</span>
              </div>
              <div className="flex items-center gap-5">
                <Ring percent={calPct} size={96} stroke={7} color="#FF9F0A">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-lg font-bold text-[#F5F5F7] leading-none">
                      {calPct > 0 ? `${calPct}%` : '—'}
                    </span>
                  </div>
                </Ring>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-mono text-[34px] font-semibold text-[#F5F5F7] leading-none tracking-tight">
                      {totalMacros.calories > 0 ? totalMacros.calories : '—'}
                    </span>
                    {totalMacros.calories > 0 && <span className="text-sm text-[#6B6B75]">kcal</span>}
                  </div>
                  {totalMacros.calories > 0 ? (
                    <>
                      <div className="flex gap-4 mt-3">
                        <MacroMini label="P" value={Math.round(totalMacros.proteinG)} unit="g" color="#30D158" />
                        <MacroMini label="C" value={Math.round(totalMacros.carbsG)} unit="g" color="#0A84FF" />
                        <MacroMini label="F" value={Math.round(totalMacros.fatG)} unit="g" color="#FF9F0A" />
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1A1A1D]">
                        <span className="text-[10px] font-mono text-[#44444A]">TDEE ~{tdee}</span>
                        <span className="text-[10px] font-mono font-semibold" style={{ color: netCals !== null && netCals <= 0 ? '#30D158' : '#FF9F0A' }}>
                          Net {netCals !== null && netCals > 0 ? '+' : ''}{netCals} kcal
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-[#44444A] font-mono mt-3">Log food to see macros</p>
                      <p className="text-[10px] font-mono text-[#2A2A2F] mt-1">TDEE ~{tdee} kcal today</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ── Protein ring ──────────────────────────────────────── */}
        <FadeIn delay={180}>
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Label>Protein today</Label>
                <span className="text-[10px] font-mono text-[#44444A]">target {proteinTarget}g</span>
              </div>
              <div className="flex items-center gap-5">
                <Ring percent={proteinPct} size={96} stroke={7} color="#30D158">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-lg font-bold text-[#F5F5F7] leading-none">
                      {proteinPct > 0 ? `${proteinPct}%` : '—'}
                    </span>
                  </div>
                </Ring>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-mono text-[34px] font-semibold text-[#F5F5F7] leading-none tracking-tight">
                      {totalMacros.proteinG > 0 ? Math.round(totalMacros.proteinG) : '—'}
                    </span>
                    {totalMacros.proteinG > 0 && <span className="text-sm text-[#6B6B75]">g</span>}
                  </div>
                  <div className="mt-3">
                    <div className="h-[3px] w-full rounded-full bg-[#1C1C1E] overflow-hidden mb-1.5">
                      <BarFill percent={proteinPct} color="#30D158" />
                    </div>
                    <p className="text-[10px] text-[#44444A] font-mono">
                      {Math.max(0, proteinTarget - Math.round(totalMacros.proteinG))}g left to hit target
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ── Weight trend ──────────────────────────────────────── */}
        <FadeIn delay={240} className="lg:col-span-2">
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Label>Weight trend</Label>
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-[#44444A]">Start <span className="text-[#8E8E93]">{startWeight}kg</span></span>
                  <span className="text-[#44444A]">Target <span className="text-[#0A84FF]">{profile?.goalWeightKg ?? '—'}kg</span></span>
                </div>
              </div>
              <WeightSparkline data={weightHistory} />
            </div>
          </Card>
        </FadeIn>

        {/* ── Adherence ─────────────────────────────────────────── */}
        <FadeIn delay={300}>
          <Card>
            <div className="p-5">
              <Label>Adherence</Label>
              <div className="flex items-center gap-4 mt-3">
                <Ring percent={adherence.last7DaysAvg} size={88} stroke={7} color={adherenceColor}>
                  <span className="font-mono text-sm font-bold" style={{ color: adherence.last7DaysAvg === 0 ? '#44444A' : adherenceColor }}>
                    {adherence.last7DaysAvg === 0 ? '—' : adherence.last7DaysAvg}
                  </span>
                </Ring>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-semibold text-[#F5F5F7]">
                      {adherence.last7DaysAvg === 0 ? '—' : adherence.last7DaysAvg}
                    </span>
                    <span className="text-sm text-[#6B6B75]">/ 100</span>
                  </div>
                  <p className="text-xs text-[#44444A] font-mono mt-0.5">7-day average</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#FFD60A]">🔥</span>
                    <span className="font-mono text-sm font-semibold text-[#F5F5F7]">
                      {adherence.currentStreak > 0 ? adherence.currentStreak : '—'}
                    </span>
                    <span className="text-xs text-[#44444A]">day streak</span>
                  </div>
                  <div className="mt-2.5">
                    <AdherenceDots history={adherence.history} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ── Steps ─────────────────────────────────────────────── */}
        <FadeIn delay={360}>
          <Card>
            <div className="p-5">
              <Label>Steps today</Label>
              <div className="flex items-center gap-4 mt-3">
                <Ring percent={stepsPct} size={88} stroke={7} color="#BF5AF2">
                  <Footprints size={16} className="text-[#BF5AF2]" />
                </Ring>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-semibold text-[#F5F5F7]">
                      {log.stepsCount != null ? log.stepsCount.toLocaleString() : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-[#44444A] font-mono mt-0.5">of {stepTarget.toLocaleString()} target</p>
                  {/* Quick log */}
                  <div className="flex gap-1.5 mt-3">
                    <input
                      value={stepsVal}
                      onChange={e => setStepsVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { const n = parseInt(stepsVal); if (!isNaN(n)) setSteps(n); }}}
                      type="number"
                      placeholder="Log steps"
                      className="flex-1 h-8 rounded-lg border border-[#222225] bg-[#0E0E10] px-2.5 text-xs font-mono text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#0A84FF]/60 transition-colors min-w-0"
                    />
                    <button
                      onClick={() => { const n = parseInt(stepsVal); if (!isNaN(n)) setSteps(n); }}
                      className="h-8 px-2.5 rounded-lg bg-[#1C1C1E] hover:bg-[#2C2C2E] text-xs text-[#8E8E93] transition-colors shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ── Training week ─────────────────────────────────────── */}
        <FadeIn delay={420} className="lg:col-span-2">
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Label>This week</Label>
                <div className="flex gap-3 text-xs font-mono text-[#44444A]">
                  <span>Gym <span className="text-[#0A84FF]">{gymDoneCount}/{plan.days.filter(d => d.sessionType === 'gym').length}</span></span>
                  <span>Cardio <span className="text-[#30D158]">{cardioDoneCount}/{plan.days.filter(d => d.sessionType === 'cardio').length}</span></span>
                </div>
              </div>
              <TrainingStrip days={plan.days} logs={weekLogs as ReturnType<typeof useDailyLog>['log'][]} />

              {/* Today quick actions */}
              {todayPlan && (
                <div className="mt-4 pt-4 border-t border-[#1A1A1D]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#44444A] font-mono mb-0.5">Today</p>
                      <p className="text-sm font-semibold text-[#F5F5F7]">{todayPlan.sessionLabel}</p>
                    </div>
                    {todayPlan.sessionType === 'gym' && (
                      <button
                        onClick={() => setGymDone(!log.gymDone)}
                        className={clsx(
                          'flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all duration-200',
                          log.gymDone
                            ? 'bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/25'
                            : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#222225] hover:border-[#0A84FF]/25 hover:text-[#0A84FF]'
                        )}
                      >
                        {log.gymDone ? <><Check size={12} /> Done</> : <><Dumbbell size={12} /> Mark done</>}
                      </button>
                    )}
                    {todayPlan.sessionType === 'cardio' && (
                      <button
                        onClick={() => setCardioDone(!log.cardioDone)}
                        className={clsx(
                          'flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all duration-200',
                          log.cardioDone
                            ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/25'
                            : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#222225] hover:border-[#30D158]/25 hover:text-[#30D158]'
                        )}
                      >
                        {log.cardioDone ? <><Check size={12} /> Done</> : <><Wind size={12} /> Mark done</>}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function BarFill({ percent, color }: { percent: number; color: string }) {
  return (
    <div
      className="h-full rounded-full"
      style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}50` }}
    />
  );
}

function MacroMini({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
      <span className="font-mono text-[#8E8E93]">{value}{unit}</span>
    </div>
  );
}
