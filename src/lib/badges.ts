import { AdherenceDay, PREntry, BadgeStatus } from '@/types';
import { USER_PROFILE } from './constants';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (ctx: BadgeContext) => { unlocked: boolean; progress?: number; target?: number };
}

interface BadgeContext {
  adherenceHistory: AdherenceDay[];
  prs: Record<string, PREntry>;
  gymCompletedDates: string[];
  foodLoggedDates: string[];
  stepHitDates: string[];
  proteinHitDates: string[];
}

function consecutiveStreak(dates: string[], minScore?: number, scores?: Record<string, number>): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let best = 0, cur = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (minScore !== undefined && scores && (scores[sorted[i]] ?? 0) < minScore) { cur = 0; continue; }
    if (i === 0) { cur = 1; continue; }
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = differenceInCalendarDays(curr, prev);
    cur = diff === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return Math.max(best, cur);
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'day_1',
    name: 'First Step',
    emoji: '🚀',
    description: 'Log your very first day',
    check: ({ adherenceHistory }) => ({ unlocked: adherenceHistory.length > 0 }),
  },
  {
    id: 'week_1',
    name: 'Week Warrior',
    emoji: '🔥',
    description: '7-day adherence streak ≥70',
    check: ({ adherenceHistory }) => {
      const scores: Record<string, number> = {};
      for (const d of adherenceHistory) scores[d.dateISO] = d.score;
      const streak = consecutiveStreak(adherenceHistory.map(d => d.dateISO), 70, scores);
      return { unlocked: streak >= 7, progress: Math.min(streak, 7), target: 7 };
    },
  },
  {
    id: 'fortnight',
    name: 'Fortnight Grind',
    emoji: '⚡',
    description: '14-day adherence streak ≥70',
    check: ({ adherenceHistory }) => {
      const scores: Record<string, number> = {};
      for (const d of adherenceHistory) scores[d.dateISO] = d.score;
      const streak = consecutiveStreak(adherenceHistory.map(d => d.dateISO), 70, scores);
      return { unlocked: streak >= 14, progress: Math.min(streak, 14), target: 14 };
    },
  },
  {
    id: 'month',
    name: 'Month Masher',
    emoji: '🏆',
    description: '30-day adherence streak ≥70',
    check: ({ adherenceHistory }) => {
      const scores: Record<string, number> = {};
      for (const d of adherenceHistory) scores[d.dateISO] = d.score;
      const streak = consecutiveStreak(adherenceHistory.map(d => d.dateISO), 70, scores);
      return { unlocked: streak >= 30, progress: Math.min(streak, 30), target: 30 };
    },
  },
  {
    id: 'protein_week',
    name: 'Protein King',
    emoji: '💪',
    description: '7 consecutive days hitting 160g protein',
    check: ({ proteinHitDates }) => {
      const streak = consecutiveStreak(proteinHitDates);
      return { unlocked: streak >= 7, progress: Math.min(streak, 7), target: 7 };
    },
  },
  {
    id: 'steps_week',
    name: 'Step Master',
    emoji: '👟',
    description: '7 consecutive days hitting 10k steps',
    check: ({ stepHitDates }) => {
      const streak = consecutiveStreak(stepHitDates);
      return { unlocked: streak >= 7, progress: Math.min(streak, 7), target: 7 };
    },
  },
  {
    id: 'gym_10',
    name: 'Iron Will',
    emoji: '🏋️',
    description: 'Complete 10 gym sessions',
    check: ({ gymCompletedDates }) => ({
      unlocked: gymCompletedDates.length >= 10,
      progress: Math.min(gymCompletedDates.length, 10),
      target: 10,
    }),
  },
  {
    id: 'pr_5',
    name: 'PR Machine',
    emoji: '🥇',
    description: 'Set 5 personal records',
    check: ({ prs }) => {
      const count = Object.keys(prs).length;
      return { unlocked: count >= 5, progress: Math.min(count, 5), target: 5 };
    },
  },
  {
    id: 'clean_week',
    name: 'Clean Eater',
    emoji: '🥗',
    description: 'Log food every day for 7 days straight',
    check: ({ foodLoggedDates }) => {
      const streak = consecutiveStreak(foodLoggedDates);
      return { unlocked: streak >= 7, progress: Math.min(streak, 7), target: 7 };
    },
  },
  {
    id: 'halfway',
    name: 'Halfway There',
    emoji: '🎯',
    description: 'Reach day 35 of the 69-day challenge',
    check: () => {
      const elapsed = differenceInCalendarDays(new Date(), parseISO(USER_PROFILE.startDate));
      return { unlocked: elapsed >= 35, progress: Math.min(elapsed, 35), target: 35 };
    },
  },
  {
    id: 'home_stretch',
    name: 'Home Stretch',
    emoji: '🔑',
    description: 'Reach day 55 of the challenge',
    check: () => {
      const elapsed = differenceInCalendarDays(new Date(), parseISO(USER_PROFILE.startDate));
      return { unlocked: elapsed >= 55, progress: Math.min(elapsed, 55), target: 55 };
    },
  },
  {
    id: 'champion',
    name: 'Champion',
    emoji: '👑',
    description: 'Complete all 69 days',
    check: () => {
      const elapsed = differenceInCalendarDays(new Date(), parseISO(USER_PROFILE.startDate));
      return { unlocked: elapsed >= 69, progress: Math.min(elapsed, 69), target: 69 };
    },
  },
];

export function computeBadges(
  adherenceHistory: AdherenceDay[],
  prs: Record<string, PREntry>,
  gymCompletedDates: string[],
  foodLoggedDates: string[],
  stepHitDates: string[],
  proteinHitDates: string[],
  savedUnlocks: Record<string, number>,
): BadgeStatus[] {
  const ctx: BadgeContext = { adherenceHistory, prs, gymCompletedDates, foodLoggedDates, stepHitDates, proteinHitDates };
  return BADGE_DEFS.map(def => {
    const result = def.check(ctx);
    const unlockedAt = result.unlocked ? (savedUnlocks[def.id] ?? Date.now()) : undefined;
    return {
      id: def.id,
      name: def.name,
      emoji: def.emoji,
      description: def.description,
      unlocked: result.unlocked,
      unlockedAt,
      progress: result.progress,
      target: result.target,
    };
  });
}

export { BADGE_DEFS };
