import { addDays, getDay } from 'date-fns';
import { WEEK_TEMPLATE, PROTEIN_TARGET } from './constants';
import { toISO, getWeekStart } from './dateUtils';
import type { DayPlan, WeeklyPlan } from '@/types';

export function generateWeek(weekStartISO: string): WeeklyPlan {
  const start = new Date(weekStartISO + 'T00:00:00');
  const days: DayPlan[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const dow = getDay(date); // 0=Sun, 1=Mon...
    const template = WEEK_TEMPLATE[dow];
    return {
      dateISO: toISO(date),
      dayOfWeek: dow,
      sessionType: template.sessionType,
      sessionLabel: template.sessionLabel,
      calorieTarget: template.calorieTarget,
      proteinTarget: PROTEIN_TARGET,
      cardioMinutes: template.cardioMinutes,
      stepTarget: template.stepTarget,
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
