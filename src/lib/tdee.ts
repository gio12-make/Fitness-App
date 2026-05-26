import { SessionType } from '@/types';
import { USER_PROFILE } from './constants';

// Harris-Benedict BMR for Giorgio: 22yo, 74kg, 177cm male
const BMR =
  88.362 +
  13.397 * USER_PROFILE.weightKg +
  4.799 * USER_PROFILE.heightCm -
  5.677 * USER_PROFILE.ageYears; // ≈ 1804 kcal

const MULTIPLIERS: Record<SessionType, number> = {
  gym:    1.55,
  cardio: 1.45,
  rest:   1.375,
};

export function getTDEE(sessionType: SessionType): number {
  return Math.round(BMR * MULTIPLIERS[sessionType]);
}

export function getNetCalories(consumed: number, sessionType: SessionType): number {
  return consumed - getTDEE(sessionType);
}
