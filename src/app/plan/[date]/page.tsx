'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { useDailyLog } from '@/hooks/useDailyLog';
import { todayISO, formatDisplayDate } from '@/lib/dateUtils';
import { ArrowLeft, Dumbbell, Wind, Footprints, Flame, Check, Scale, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

interface GymSessionLog {
  exercises: { name: string; sets: { weight: number | ''; reps: number | '' }[] }[];
  feel: number;
  notes: string;
  completedAt: number | null;
  cardioDetails?: { duration: number; distance?: number; type: string; avgHR?: number };
}

const FEEL = ['', '😴 Rough', '😕 Low', '😐 OK', '💪 Strong', '🔥 Beast'];
const FEEL_COLORS = ['', '#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#0A84FF'];

export default function PlanDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const { plan } = useWeeklyPlan();
  const { log, totalMacros } = useDailyLog(date);
  const today = todayISO();

  const dayPlan = plan.days.find(d => d.dateISO === date);

  const gymSession = useMemo((): GymSessionLog | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`fit_gym_${date}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [date]);

  if (!dayPlan) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 pt-8 pb-24">
        <Link href="/plan" className="flex items-center gap-1.5 text-[11px] font-mono text-[#44444A] hover:text-[#8E8E93] mb-6">
          <ArrowLeft size={12} /> Back to plan
        </Link>
        <p className="text-sm text-[#44444A]">Day not found in current week&apos;s plan.</p>
      </div>
    );
  }

  const isToday = date === today;
  const isPast = date < today;
  const sessionColor = dayPlan.sessionType === 'gym' ? '#0A84FF' : dayPlan.sessionType === 'cardio' ? '#30D158' : '#3A3A3F';
  const gradFrom = dayPlan.sessionType === 'gym' ? 'rgba(10,132,255,0.15)' : dayPlan.sessionType === 'cardio' ? 'rgba(48,209,88,0.15)' : 'rgba(58,58,63,0.1)';

  const calPct = dayPlan.calorieTarget > 0 ? Math.round((totalMacros.calories / dayPlan.calorieTarget) * 100) : 0;
  const proteinPct = Math.round((totalMacros.proteinG / 160) * 100);
  const stepsPct = log.stepsCount ? Math.round((log.stepsCount / dayPlan.stepTarget) * 100) : 0;

  const sessionDone = dayPlan.sessionType === 'gym' ? log.gymDone : dayPlan.sessionType === 'cardio' ? log.cardioDone : true;

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-4 pt-8 pb-6" style={{ background: `linear-gradient(180deg, ${gradFrom} 0%, transparent 100%)` }}>
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <Link href="/plan" className="flex items-center gap-1.5 text-[11px] font-mono text-[#44444A] hover:text-[#8E8E93] mb-4">
            <ArrowLeft size={12} /> Back to plan
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${sessionColor}20`, border: `1px solid ${sessionColor}40` }}>
                {dayPlan.sessionType === 'cardio' ? <Wind size={18} style={{ color: sessionColor }} /> :
                 dayPlan.sessionType === 'gym' ? <Dumbbell size={18} style={{ color: sessionColor }} /> :
                 <Footprints size={18} style={{ color: sessionColor }} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">{dayPlan.sessionLabel}</h1>
                <p className="text-[11px] font-mono mt-0.5" style={{ color: `${sessionColor}70` }}>
                  {formatDisplayDate(date)}
                  {isToday && <span className="ml-2 text-[#F5F5F7]">· Today</span>}
                </p>
              </div>
            </div>
            {sessionDone && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)' }}>
                <Check size={14} className="text-[#30D158]" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4 flex flex-col gap-3">

        {/* Targets */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-4">Daily Targets</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Calories', target: `${dayPlan.calorieTarget} kcal`, actual: totalMacros.calories > 0 ? `${totalMacros.calories} logged` : null, pct: calPct, color: '#FF9F0A', Icon: Flame },
              { label: 'Protein', target: '160g', actual: totalMacros.proteinG > 0 ? `${Math.round(totalMacros.proteinG)}g logged` : null, pct: proteinPct, color: '#30D158', Icon: TrendingUp },
              { label: 'Steps', target: `${(dayPlan.stepTarget / 1000).toFixed(0)}k`, actual: log.stepsCount ? `${log.stepsCount.toLocaleString()} done` : null, pct: stepsPct, color: '#0A84FF', Icon: Footprints },
              ...(dayPlan.cardioMinutes > 0 ? [{ label: 'Cardio', target: `${dayPlan.cardioMinutes} min`, actual: null, pct: 0, color: '#30D158', Icon: Wind }] : []),
            ].map(({ label, target, actual, pct, color, Icon }) => (
              <div key={label} className="rounded-xl bg-[#0E0E10] border border-[#1A1A1D] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={11} style={{ color }} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#44444A]">{label}</span>
                </div>
                <p className="font-mono text-sm font-semibold text-[#F5F5F7]">{target}</p>
                {actual && <p className="text-[9px] font-mono mt-1" style={{ color }}>{actual}</p>}
                {pct > 0 && (
                  <div className="mt-2 h-[3px] w-full rounded-full bg-[#1C1C1E] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body stats for this day */}
        {(log.weightKg || log.stepsCount) && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-3">Day Stats</p>
            <div className="flex gap-4">
              {log.weightKg && (
                <div className="flex items-center gap-2">
                  <Scale size={14} className="text-[#44444A]" />
                  <span className="font-mono text-sm font-semibold text-[#F5F5F7]">{log.weightKg} kg</span>
                </div>
              )}
              {log.stepsCount && (
                <div className="flex items-center gap-2">
                  <Footprints size={14} className="text-[#44444A]" />
                  <span className="font-mono text-sm font-semibold text-[#F5F5F7]">{log.stepsCount.toLocaleString()} steps</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cardio details */}
        {gymSession?.cardioDetails && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-3">Cardio Session</p>
            <div className="flex gap-4 flex-wrap">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#44444A]">Type</p>
                <p className="font-mono text-sm font-semibold text-[#F5F5F7] mt-0.5">{gymSession.cardioDetails.type}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#44444A]">Duration</p>
                <p className="font-mono text-sm font-semibold text-[#F5F5F7] mt-0.5">{gymSession.cardioDetails.duration} min</p>
              </div>
              {gymSession.cardioDetails.distance && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#44444A]">Distance</p>
                  <p className="font-mono text-sm font-semibold text-[#F5F5F7] mt-0.5">{gymSession.cardioDetails.distance} km</p>
                </div>
              )}
              {gymSession.cardioDetails.avgHR && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#44444A]">Avg HR</p>
                  <p className="font-mono text-sm font-semibold text-[#F5F5F7] mt-0.5">{gymSession.cardioDetails.avgHR} bpm</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gym session */}
        {gymSession && gymSession.exercises.length > 0 && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1D]">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">Exercises</p>
              {gymSession.feel > 0 && (
                <span className="text-xs" style={{ color: FEEL_COLORS[gymSession.feel] }}>{FEEL[gymSession.feel]}</span>
              )}
            </div>
            {gymSession.exercises.map((ex, i) => {
              const validSets = ex.sets.filter(s => s.weight !== '' && s.reps !== '');
              return (
                <div key={i} className={clsx('px-5 py-3.5', i < gymSession.exercises.length - 1 && 'border-b border-[#1A1A1D]')}>
                  <p className="text-sm font-semibold text-[#F5F5F7] mb-2">{ex.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {validSets.map((set, si) => (
                      <span key={si} className="font-mono text-[10px] text-[#8E8E93] bg-[#0E0E10] border border-[#1A1A1D] px-2 py-1 rounded-lg">
                        {set.weight}kg × {set.reps}
                      </span>
                    ))}
                    {validSets.length === 0 && <span className="text-[10px] text-[#44444A] font-mono">no sets logged</span>}
                  </div>
                </div>
              );
            })}
            {gymSession.notes ? (
              <div className="px-5 py-4 border-t border-[#1A1A1D]">
                <p className="text-[9px] uppercase tracking-wider text-[#44444A] mb-1">Notes</p>
                <p className="text-sm text-[#8E8E93] leading-relaxed">{gymSession.notes}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Food log */}
        {log.foodEntries.length > 0 && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1D]">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">Food Logged</p>
              <span className="font-mono text-xs text-[#FF9F0A]">{totalMacros.calories} kcal</span>
            </div>
            {log.foodEntries.map((entry, i) => (
              <div key={entry.id} className={clsx('flex items-center justify-between px-5 py-3', i < log.foodEntries.length - 1 && 'border-b border-[#1A1A1D]')}>
                <p className="text-sm text-[#F5F5F7] truncate flex-1">{entry.description}</p>
                <div className="flex gap-3 text-[10px] font-mono text-[#44444A] ml-3 shrink-0">
                  <span className="text-[#FF9F0A]">{entry.macros.calories}kcal</span>
                  <span className="text-[#30D158]">{entry.macros.proteinG}g P</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No data empty state */}
        {!gymSession?.exercises?.length && log.foodEntries.length === 0 && !log.weightKg && (
          <div className="rounded-2xl border border-dashed border-[#222225] p-8 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-semibold text-[#44444A]">
              {isToday ? 'Nothing logged yet today' : isPast ? 'Nothing was logged this day' : 'No data yet — this day is upcoming'}
            </p>
            {isToday && (
              <Link
                href={dayPlan.sessionType === 'gym' || dayPlan.sessionType === 'cardio' ? '/gym' : '/food'}
                className="mt-2 text-[11px] font-semibold text-[#0A84FF] hover:underline"
              >
                {dayPlan.sessionType === 'gym' ? 'Go to gym →' : dayPlan.sessionType === 'cardio' ? 'Log cardio →' : 'Log food →'}
              </Link>
            )}
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
