import type { SessionType, UserProfile } from '@/types';

const MULTIPLIERS: Record<SessionType, number> = {
  gym:    1.55,
  cardio: 1.45,
  rest:   1.375,
};

function calcBMR(p: UserProfile): number {
  if (p.sex === 'female') {
    return 447.593 + 9.247 * p.weightKg + 3.098 * p.heightCm - 4.330 * p.ageYears;
  }
  return 88.362 + 13.397 * p.weightKg + 4.799 * p.heightCm - 5.677 * p.ageYears;
}

export function getTDEE(sessionType: SessionType, profile?: UserProfile | null): number {
  const bmr = profile
    ? calcBMR(profile)
    : 88.362 + 13.397 * 74 + 4.799 * 177 - 5.677 * 22; // Giorgio fallback
  return Math.round(bmr * MULTIPLIERS[sessionType]);
}

export function getNetCalories(consumed: number, sessionType: SessionType, profile?: UserProfile | null): number {
  return consumed - getTDEE(sessionType, profile);
}
