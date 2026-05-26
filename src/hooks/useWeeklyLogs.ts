'use client';

import { useMemo } from 'react';
import type { DailyLog } from '@/types';

export function useWeeklyLogs(dateISOs: string[]): (DailyLog | null)[] {
  return useMemo(() => {
    if (typeof window === 'undefined') return dateISOs.map(() => null);
    return dateISOs.map((iso) => {
      try {
        const raw = window.localStorage.getItem(`fit_daily_${iso}`);
        return raw ? (JSON.parse(raw) as DailyLog) : null;
      } catch {
        return null;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateISOs.join(',')]);
}
