'use client';

import { useLocalStorage } from './useLocalStorage';
import type { UserProfile } from '@/types';

// Harris-Benedict BMR
function calcBMR(p: UserProfile): number {
  if (p.sex === 'female') {
    return 447.593 + 9.247 * p.weightKg + 3.098 * p.heightCm - 4.330 * p.ageYears;
  }
  return 88.362 + 13.397 * p.weightKg + 4.799 * p.heightCm - 5.677 * p.ageYears;
}

// Deurenberg BF% estimate from BMI + age + sex
function estimateBF(weightKg: number, heightCm: number, ageYears: number, sex: 'male' | 'female'): number {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const sexVal = sex === 'male' ? 1 : 0;
  return 1.2 * bmi + 0.23 * ageYears - 10.8 * sexVal - 5.4;
}

// Goal weight: lean mass / (1 - targetBF)
function calcGoalWeight(weightKg: number, heightCm: number, ageYears: number, sex: 'male' | 'female'): number {
  const bf = estimateBF(weightKg, heightCm, ageYears, sex) / 100;
  const leanMass = weightKg * (1 - bf);
  const targetBF = sex === 'male' ? 0.12 : 0.20;
  return Math.round((leanMass / (1 - targetBF)) * 10) / 10;
}

export function calcProfileTargets(p: UserProfile) {
  const bmr = calcBMR(p);
  const tdeeGym    = Math.round(bmr * 1.55);
  const tdeeCardio = Math.round(bmr * 1.45);
  const tdeeRest   = Math.round(bmr * 1.375);
  const deficit = 300;
  return {
    calorieTrainingDay: tdeeGym - deficit,
    calorieCardioDay:   tdeeCardio - deficit,
    calorieRestDay:     tdeeRest - deficit,
    proteinTargetG:     Math.round(p.weightKg * 2 / 5) * 5,
    tdeeGym,
    tdeeCardio,
    tdeeRest,
    estimatedBF: Math.round(estimateBF(p.weightKg, p.heightCm, p.ageYears, p.sex)),
  };
}

// Build a full profile from setup inputs (calculates targets + goal weight)
export function buildProfile(
  name: string,
  sex: 'male' | 'female',
  ageYears: number,
  weightKg: number,
  heightCm: number,
): UserProfile {
  const draft: UserProfile = {
    name,
    sex,
    weightKg,
    heightCm,
    ageYears,
    deadline: '2026-08-01',
    goalWeightKg: calcGoalWeight(weightKg, heightCm, ageYears, sex),
    proteinTargetG: Math.round(weightKg * 2 / 5) * 5,
    calorieTrainingDay: 0,
    calorieCardioDay: 0,
    calorieRestDay: 0,
    stepTarget: 10000,
    startWeight: weightKg,
    startDate: new Date().toISOString().split('T')[0],
  };
  const targets = calcProfileTargets(draft);
  return {
    ...draft,
    calorieTrainingDay: targets.calorieTrainingDay,
    calorieCardioDay:   targets.calorieCardioDay,
    calorieRestDay:     targets.calorieRestDay,
    proteinTargetG:     targets.proteinTargetG,
  };
}

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('fit_profile', null);
  return { profile, setProfile, isSetup: profile !== null };
}
