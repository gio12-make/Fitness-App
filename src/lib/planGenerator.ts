import { addDays, getDay } from 'date-fns';
import { WEEK_TEMPLATE, PROTEIN_TARGET } from './constants';
import { toISO, getWeekStart } from './dateUtils';
import type { DayPlan, WeeklyPlan } from '@/types';

interface CalTargets {
  calorieTrainingDay: number;
  calorieCardioDay: number;
  calorieRestDay: number;
  proteinTargetG: number;
  stepTarget: number;
}

export function generateWeek(weekStartISO: string, targets?: CalTargets | null): WeeklyPlan {
  const start = new Date(weekStartISO + 'T00:00:00');
  const days: DayPlan[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const dow = getDay(date); // 0=Sun, 1=Mon...
    const template = WEEK_TEMPLATE[dow];
    const calTarget = targets
      ? template.sessionType === 'gym'    ? targets.calorieTrainingDay
      : template.sessionType === 'cardio' ? targets.calorieCardioDay
      : targets.calorieRestDay
      : template.calorieTarget;
    return {
      dateISO: toISO(date),
      dayOfWeek: dow,
      sessionType: template.sessionType,
      sessionLabel: template.sessionLabel,
      calorieTarget: calTarget,
      proteinTarget: targets?.proteinTargetG ?? PROTEIN_TARGET,
      cardioMinutes: template.cardioMinutes,
      stepTarget: targets?.stepTarget ?? template.stepTarget,
    };
  });

  return {
    weekStartISO,
    days,
    generatedAt: Date.now(),
  };
}

export function getTodayPlan(plan: WeeklyPlan, todayISO: string): DayPlan | undefined {
  return plan.days.find((d) => d.dateISO === todayISO);
}

export function getCurrentWeekPlanKey(): string {
  return `fit_weekly_plan_${toISO(getWeekStart())}`;
}
