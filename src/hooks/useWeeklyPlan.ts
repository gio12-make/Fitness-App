'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useProfile } from './useProfile';
import { generateWeek, getTodayPlan } from '@/lib/planGenerator';
import { getWeekStartISO, todayISO } from '@/lib/dateUtils';
import type { WeeklyPlan, DayPlan } from '@/types';

export function useWeeklyPlan() {
  const weekStart = getWeekStartISO();
  const key = `fit_weekly_plan_${weekStart}`;
  const { profile } = useProfile();

  const targets = profile ? {
    calorieTrainingDay: profile.calorieTrainingDay,
    calorieCardioDay:   profile.calorieCardioDay,
    calorieRestDay:     profile.calorieRestDay,
    proteinTargetG:     profile.proteinTargetG,
    stepTarget:         profile.stepTarget,
  } : null;

  const defaultPlan = useMemo(() => generateWeek(weekStart, targets), [weekStart, profile]);
  const [plan, setPlan] = useLocalStorage<WeeklyPlan>(key, defaultPlan);

  const today = todayISO();
  const todayPlan: DayPlan | undefined = useMemo(() => getTodayPlan(plan, today), [plan, today]);

  return { plan, todayPlan, regeneratePlan: () => setPlan(generateWeek(weekStart, targets)) };
}
