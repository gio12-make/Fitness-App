'use client';

import { useLocalStorage } from './useLocalStorage';
import { useAdherence } from './useAdherence';
import { todayISO } from '@/lib/dateUtils';
import type { CompetitionData } from '@/types';

const DEFAULT: CompetitionData = { mateName: 'Your Mate', mateScoreHistory: [] };

export function useCompetition() {
  const [competition, setCompetition] = useLocalStorage<CompetitionData>('fit_competition', DEFAULT);
  const adherence = useAdherence();
  const myScore = adherence.last7DaysAvg;

  const latestMateScore = competition.mateScoreHistory.length > 0
    ? competition.mateScoreHistory[competition.mateScoreHistory.length - 1].score
    : 0;

  const delta = myScore - latestMateScore;

  const getDeltaMessage = () => {
    if (delta > 10) return "You're ahead. Keep the pressure on.";
    if (delta >= 0) return "Neck and neck. Don't let up.";
    if (delta >= -10) return "He's ahead. Time to lock in.";
    return "You're behind. Make today count.";
  };

  const setMateName = (name: string) =>
    setCompetition((prev) => ({ ...prev, mateName: name }));

  const logMateScore = (score: number) =>
    setCompetition((prev) => ({
      ...prev,
      mateScoreHistory: [...prev.mateScoreHistory, { dateISO: todayISO(), score }],
    }));

  return { competition, myScore, latestMateScore, delta, getDeltaMessage, setMateName, logMateScore, adherence };
}
