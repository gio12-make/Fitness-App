'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { todayISO } from '@/lib/dateUtils';
import { WEEK_TEMPLATE } from '@/lib/constants';
import type { DailyLog, FoodEntry, Macros, DayType } from '@/types';

function getDefaultLog(dateISO: string): DailyLog {
  const dow = new Date(dateISO + 'T00:00:00').getDay();
  const template = WEEK_TEMPLATE[dow];
  const dayType: DayType = template.sessionType === 'gym' ? 'training' : template.sessionType === 'cardio' ? 'cardio' : 'rest';
  return {
    dateISO,
    foodEntries: [],
    weightKg: null,
    waistCm: null,
    stepsCount: null,
    note: '',
    gymDone: false,
    cardioDone: false,
    dayType,
  };
}

export function useDailyLog(dateISO?: string) {
  const date = dateISO ?? todayISO();
  const key = `fit_daily_${date}`;
  const [log, setLog] = useLocalStorage<DailyLog>(key, getDefaultLog(date));

  const totalMacros = useMemo<Macros>(() => {
    return log.foodEntries.reduce<Macros>(
      (acc, e) => ({
        calories: acc.calories + e.macros.calories,
        proteinG: +(acc.proteinG + e.macros.proteinG).toFixed(1),
        carbsG: +(acc.carbsG + e.macros.carbsG).toFixed(1),
        fatG: +(acc.fatG + e.macros.fatG).toFixed(1),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  }, [log.foodEntries]);

  const addFoodEntry = (entry: FoodEntry) =>
    setLog((prev) => ({ ...prev, foodEntries: [...prev.foodEntries, entry] }));

  const updateFoodEntry = (id: string, macros: Macros, description?: string) =>
    setLog((prev) => ({
      ...prev,
      foodEntries: prev.foodEntries.map((e) =>
        e.id === id ? { ...e, macros, ...(description ? { description } : {}), estimatedBy: 'manual' as const } : e
      ),
    }));

  const deleteFoodEntry = (id: string) =>
    setLog((prev) => ({ ...prev, foodEntries: prev.foodEntries.filter((e) => e.id !== id) }));

  const setWeight = (kg: number) => setLog((prev) => ({ ...prev, weightKg: kg }));
  const setWaist = (cm: number) => setLog((prev) => ({ ...prev, waistCm: cm }));
  const setSteps = (count: number) => setLog((prev) => ({ ...prev, stepsCount: count }));
  const setGymDone = (done: boolean) => setLog((prev) => ({ ...prev, gymDone: done }));
  const setCardioDone = (done: boolean) => setLog((prev) => ({ ...prev, cardioDone: done }));
  const setNote = (text: string) => setLog((prev) => ({ ...prev, note: text }));

  return { log, totalMacros, addFoodEntry, updateFoodEntry, deleteFoodEntry, setWeight, setWaist, setSteps, setGymDone, setCardioDone, setNote };
}
