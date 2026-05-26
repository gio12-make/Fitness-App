'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateWeek, getTodayPlan } from '@/lib/planGenerator';
import { getWeekStartISO, todayISO } from '@/lib/dateUtils';
import type { WeeklyPlan, DayPlan } from '@/types';

export function useWeeklyPlan() {
  const weekStart = getWeekStartISO();
  const key = `fit_weekly_plan_${weekStart}`;
  const defaultPlan = useMemo(() => generateWeek(weekStart), [weekStart]);
  const [plan, setPlan] = useLocalStorage<WeeklyPlan>(key, defaultPlan);

  const today = todayISO();
  const todayPlan: DayPlan | undefined = useMemo(() => getTodayPlan(plan, today), [plan, today]);

  return { plan, todayPlan, regeneratePlan: () => setPlan(generateWeek(weekStart)) };
}
