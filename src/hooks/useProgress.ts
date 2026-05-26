'use client';

import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useWeeklyLogs } from './useWeeklyLogs';
import { getLast30Days } from '@/lib/dateUtils';
import type { ProgressPhoto } from '@/types';

export function useProgress() {
  const [photos, setPhotos] = useLocalStorage<ProgressPhoto[]>('fit_photos', []);
  const last30 = useMemo(() => getLast30Days(), []);
  const logs = useWeeklyLogs(last30);

  const weightHistory = useMemo(() =>
    last30
      .map((date, i) => ({ date, weight: logs[i]?.weightKg ?? null }))
      .filter((d): d is { date: string; weight: number } => d.weight !== null),
    [last30, logs]
  );

  const waistHistory = useMemo(() =>
    last30
      .map((date, i) => ({ date, waist: logs[i]?.waistCm ?? null }))
      .filter((d): d is { date: string; waist: number } => d.waist !== null),
    [last30, logs]
  );

  const addPhoto = useCallback(async (file: File, note: string) => {
    return new Promise<void>((resolve) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        URL.revokeObjectURL(img.src);
        const photo: ProgressPhoto = {
          id: crypto.randomUUID(),
          dateISO: new Date().toISOString().split('T')[0],
          dataUrl,
          note,
        };
        setPhotos((prev) => [...prev, photo]);
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  }, [setPhotos]);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [setPhotos]);

  return { photos, weightHistory, waistHistory, addPhoto, deletePhoto };
}
