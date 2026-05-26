import type { UserProfile } from '@/types';

export const USER_PROFILE: UserProfile = {
  name: 'Giorgio',
  weightKg: 74,
  heightCm: 177,
  ageYears: 22,
  deadline: '2026-08-01',
  proteinTargetG: 160,
  calorieTrainingDay: 2300,
  calorieRestDay: 2000,
  stepTarget: 10000,
  startWeight: 74,
  startDate: '2026-05-24',
};

export const DEADLINE = new Date('2026-08-01');

export const TARGET_WEIGHT_MIN = 70;
export const TARGET_WEIGHT_MAX = 72;

// Fixed weekly template indexed by day of week (0=Sun, 1=Mon, ... 6=Sat)
export const WEEK_TEMPLATE = [
  { sessionType: 'rest' as const,    sessionLabel: 'Active Rest — Walk',           calorieTarget: 2000, cardioMinutes: 0,  stepTarget: 10000 },
  { sessionType: 'gym' as const,     sessionLabel: 'Push — Chest / Shoulders / Tris', calorieTarget: 2300, cardioMinutes: 0,  stepTarget: 10000 },
  { sessionType: 'cardio' as const,  sessionLabel: 'Cardio — 30min LISS',           calorieTarget: 2000, cardioMinutes: 30, stepTarget: 10000 },
  { sessionType: 'gym' as const,     sessionLabel: 'Pull — Back / Biceps',          calorieTarget: 2300, cardioMinutes: 0,  stepTarget: 10000 },
  { sessionType: 'gym' as const,     sessionLabel: 'Legs — Quads / Hams / Glutes', calorieTarget: 2300, cardioMinutes: 0,  stepTarget: 10000 },
  { sessionType: 'gym' as const,     sessionLabel: 'Arms / Accessories',            calorieTarget: 2300, cardioMinutes: 0,  stepTarget: 10000 },
  { sessionType: 'cardio' as const,  sessionLabel: 'Cardio — 40min',               calorieTarget: 2000, cardioMinutes: 40, stepTarget: 12000 },
];

export const PROTEIN_TARGET = 160;
