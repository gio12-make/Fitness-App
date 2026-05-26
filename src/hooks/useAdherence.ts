'use client';

import { useMemo } from 'react';
import { useWeeklyLogs } from './useWeeklyLogs';
import { useWeeklyPlan } from './useWeeklyPlan';
import { computeAdherenceDay, computeAdherenceSummary } from '@/lib/adherence';
import { getLast30Days } from '@/lib/dateUtils';
import type { AdherenceSummary } from '@/types';

export function useAdherence(): AdherenceSummary {
  const { plan } = useWeeklyPlan();
  const last30 = useMemo(() => getLast30Days(), []);
  const logs = useWeeklyLogs(last30);

  return useMemo(() => {
    const adherenceDays = logs
      .map((log, i) => {
        if (!log) return null;
        const dayPlan = plan.days.find((d) => d.dateISO === last30[i]);
        return computeAdherenceDay(log, dayPlan);
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    return computeAdherenceSummary(adherenceDays);
  }, [logs, plan, last30]);
}
