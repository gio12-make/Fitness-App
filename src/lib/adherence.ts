import type { DailyLog, DayPlan, AdherenceDay, AdherenceSummary } from '@/types';
import { PROTEIN_TARGET } from './constants';

export function computeAdherenceDay(log: DailyLog, plan: DayPlan | undefined): AdherenceDay {
  const totalCals = log.foodEntries.reduce((s, e) => s + e.macros.calories, 0);
  const totalProtein = log.foodEntries.reduce((s, e) => s + e.macros.proteinG, 0);
  const target = plan?.calorieTarget ?? 2200;
  const steps = log.stepsCount ?? 0;
  const sessionType = plan?.sessionType ?? log.dayType;

  const calorieHit = totalCals > 0 && Math.abs(totalCals - target) <= 250;
  const proteinHit = totalProtein >= PROTEIN_TARGET - 15;
  const stepsHit = steps >= 9000;
  const gymHit = sessionType === 'gym' ? log.gymDone : false;
  const cardioHit = sessionType === 'cardio' ? log.cardioDone : false;

  // Raw points
  let raw = 0;
  let maxPossible = 0;

  // Calories: 30pts
  maxPossible += 30;
  if (calorieHit) raw += 30;
  else if (totalCals > 0) raw += 10; // partial credit for logging

  // Protein: 25pts
  maxPossible += 25;
  if (proteinHit) raw += 25;
  else if (totalProtein >= PROTEIN_TARGET * 0.75) raw += 12;

  // Steps: 15pts
  maxPossible += 15;
  if (stepsHit) raw += 15;
  else if (steps >= 6000) raw += 7;

  // Gym: 20pts (only on gym days)
  if (sessionType === 'gym') {
    maxPossible += 20;
    if (gymHit) raw += 20;
  }

  // Cardio: 10pts (only on cardio days)
  if (sessionType === 'cardio') {
    maxPossible += 10;
    if (cardioHit) raw += 10;
  }

  const score = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;

  return { dateISO: log.dateISO, calorieHit, proteinHit, stepsHit, gymHit, cardioHit, score };
}

export function computeAdherenceSummary(days: AdherenceDay[]): AdherenceSummary {
  if (days.length === 0) {
    return { currentStreak: 0, longestStreak: 0, last7DaysAvg: 0, last30DaysAvg: 0, history: [] };
  }

  const sorted = [...days].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  // Streak: count backwards from today
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].score >= 70) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let runningStreak = 0;
  for (const d of sorted) {
    if (d.score >= 70) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  const last7 = sorted.slice(-7);
  const last30 = sorted.slice(-30);
  const avg = (arr: AdherenceDay[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((s, d) => s + d.score, 0) / arr.length);

  return {
    currentStreak,
    longestStreak,
    last7DaysAvg: avg(last7),
    last30DaysAvg: avg(last30),
    history: sorted,
  };
}
