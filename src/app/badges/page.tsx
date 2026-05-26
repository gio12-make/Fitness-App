'use client';

import { useMemo } from 'react';
import { useAdherence } from '@/hooks/useAdherence';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { useWeeklyLogs } from '@/hooks/useWeeklyLogs';
import { computeBadges } from '@/lib/badges';
import { getLast30Days, todayISO } from '@/lib/dateUtils';
import type { PREntry } from '@/types';

function formatUnlockDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BadgesPage() {
  const adherence = useAdherence();
  const { plan } = useWeeklyPlan();
  const [savedUnlocks, setSavedUnlocks] = useLocalStorage<Record<string, number>>('fit_badges', {});
  const [prs] = useLocalStorage<Record<string, PREntry>>('fit_prs', {});

  const last30 = useMemo(() => getLast30Days(), []);
  const logs = useWeeklyLogs(last30);

  const today = todayISO();
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);
  const weekLogs = useWeeklyLogs(weekDates);

  const gymCompletedDates = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const dates: string[] = [];
    const allDates: string[] = [];
    const now = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      allDates.push(d.toISOString().split('T')[0]);
    }
    for (const date of allDates) {
      try {
        const raw = localStorage.getItem(`fit_gym_${date}`);
        if (raw) {
          const session = JSON.parse(raw);
          if (session.completedAt) dates.push(date);
        }
      } catch { /* ignore */ }
    }
    return dates;
  }, [today]);

  const foodLoggedDates = useMemo(() =>
    last30.filter((_, i) => (logs[i]?.foodEntries?.length ?? 0) > 0),
    [last30, logs]
  );

  const stepHitDates = useMemo(() =>
    last30.filter((_, i) => {
      const log = logs[i];
      const dayPlan = plan.days.find(d => d.dateISO === last30[i]);
      const target = dayPlan?.stepTarget ?? 10000;
      return log?.stepsCount != null && log.stepsCount >= target;
    }),
    [last30, logs, plan]
  );

  const proteinHitDates = useMemo(() =>
    last30.filter((_, i) => {
      const log = logs[i];
      if (!log) return false;
      const total = log.foodEntries.reduce((sum, e) => sum + e.macros.proteinG, 0);
      return total >= 160;
    }),
    [last30, logs]
  );

  const badges = useMemo(() =>
    computeBadges(
      adherence.history,
      prs,
      gymCompletedDates,
      foodLoggedDates,
      stepHitDates,
      proteinHitDates,
      savedUnlocks,
    ),
    [adherence.history, prs, gymCompletedDates, foodLoggedDates, stepHitDates, proteinHitDates, savedUnlocks]
  );

  // Persist new unlocks
  useMemo(() => {
    const now = Date.now();
    const updates: Record<string, number> = {};
    for (const b of badges) {
      if (b.unlocked && !savedUnlocks[b.id]) updates[b.id] = now;
    }
    if (Object.keys(updates).length > 0) {
      setSavedUnlocks(prev => ({ ...prev, ...updates }));
    }
  }, [badges]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div
        className="px-4 pt-8 pb-6"
        style={{ background: 'linear-gradient(180deg, rgba(94,92,230,0.16) 0%, transparent 100%)' }}
      >
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-1.5 text-[#5E5CE6]/60">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(94,92,230,0.15)', border: '1px solid rgba(94,92,230,0.3)' }}>
              <span className="text-lg">🏅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">Badges</h1>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'rgba(94,92,230,0.7)' }}>
                {unlockedCount} / {badges.length} unlocked
              </p>
            </div>
          </div>

          {/* Streak summary */}
          <div className="flex items-center gap-6 mt-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#44444A]">Current streak</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-3xl font-bold text-[#F5F5F7]">{adherence.currentStreak}</span>
                <span className="text-sm text-[#44444A]">days</span>
                <span className="text-lg ml-1">🔥</span>
              </div>
            </div>
            <div className="w-px h-10 bg-[#222225]" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#44444A]">Longest streak</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-3xl font-bold text-[#F5F5F7]">{adherence.longestStreak}</span>
                <span className="text-sm text-[#44444A]">days</span>
              </div>
            </div>
            <div className="w-px h-10 bg-[#222225]" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#44444A]">7-day avg</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-3xl font-bold text-[#F5F5F7]">
                  {adherence.last7DaysAvg > 0 ? adherence.last7DaysAvg : '—'}
                </span>
                {adherence.last7DaysAvg > 0 && <span className="text-sm text-[#44444A]">/ 100</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="rounded-2xl border p-4 flex flex-col gap-2 transition-all"
              style={badge.unlocked
                ? { backgroundColor: 'rgba(94,92,230,0.08)', borderColor: 'rgba(94,92,230,0.25)' }
                : { backgroundColor: '#111113', borderColor: '#222225' }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-2xl leading-none"
                  style={{ filter: badge.unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}
                >
                  {badge.emoji}
                </span>
                {badge.unlocked && (
                  <span className="text-[9px] font-semibold text-[#5E5CE6] bg-[#5E5CE6]/10 px-2 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${badge.unlocked ? 'text-[#F5F5F7]' : 'text-[#44444A]'}`}>
                  {badge.name}
                </p>
                <p className="text-[10px] text-[#44444A] mt-0.5 leading-snug">{badge.description}</p>
              </div>
              {badge.unlocked && badge.unlockedAt ? (
                <p className="text-[9px] font-mono text-[#5E5CE6]/70 mt-auto pt-1">
                  {formatUnlockDate(badge.unlockedAt)}
                </p>
              ) : badge.progress !== undefined && badge.target !== undefined ? (
                <div className="mt-auto pt-1">
                  <div className="flex justify-between text-[9px] font-mono text-[#44444A] mb-1">
                    <span>{badge.progress} / {badge.target}</span>
                    <span>{Math.round((badge.progress / badge.target) * 100)}%</span>
                  </div>
                  <div className="h-[3px] w-full rounded-full bg-[#1C1C1E] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((badge.progress / badge.target) * 100, 100)}%`,
                        background: 'linear-gradient(90deg, #5E5CE6, #0A84FF)',
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
