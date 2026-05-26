export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface FoodEntry {
  id: string;
  timestamp: number;
  rawInput: string;
  description: string;
  macros: Macros;
  estimatedBy: 'usda' | 'api' | 'manual' | 'estimated';
}

export type DayType = 'training' | 'cardio' | 'rest';

export interface DailyLog {
  dateISO: string;
  foodEntries: FoodEntry[];
  weightKg: number | null;
  waistCm: number | null;
  stepsCount: number | null;
  note: string;
  gymDone: boolean;
  cardioDone: boolean;
  dayType: DayType;
}

export type SessionType = 'gym' | 'cardio' | 'rest';

export interface DayPlan {
  dateISO: string;
  dayOfWeek: number;
  sessionType: SessionType;
  sessionLabel: string;
  calorieTarget: number;
  proteinTarget: number;
  cardioMinutes: number;
  stepTarget: number;
}

export interface WeeklyPlan {
  weekStartISO: string;
  days: DayPlan[];
  generatedAt: number;
}

export interface ProgressPhoto {
  id: string;
  dateISO: string;
  dataUrl: string;
  note: string;
}

export interface AdherenceDay {
  dateISO: string;
  calorieHit: boolean;
  proteinHit: boolean;
  stepsHit: boolean;
  gymHit: boolean;
  cardioHit: boolean;
  score: number;
}

export interface AdherenceSummary {
  currentStreak: number;
  longestStreak: number;
  last7DaysAvg: number;
  last30DaysAvg: number;
  history: AdherenceDay[];
}

export interface CompetitionData {
  mateName: string;
  mateScoreHistory: { dateISO: string; score: number }[];
}

export interface UserProfile {
  name: string;
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  ageYears: number;
  deadline: string;
  goalWeightKg: number;
  proteinTargetG: number;
  calorieTrainingDay: number;
  calorieCardioDay: number;
  calorieRestDay: number;
  stepTarget: number;
  startWeight: number;
  startDate: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: { name: string; defaultSets: number }[];
  createdAt: number;
}

export interface PREntry {
  weight: number;
  reps: number;
  dateISO: string;
}

export interface CardioDetails {
  duration: number;
  distance?: number;
  steps?: number;
  type: 'LISS' | 'HIIT' | 'Run' | 'Cycle' | 'Walk' | 'Football' | 'Tennis' | 'Basketball' | 'Swimming' | 'Golf' | 'Other';
  avgHR?: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'chicken' | 'fish' | 'meat' | 'vegetarian' | 'vegan' | 'dessert' | 'airfryer';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  url: string;
}

export interface BadgeStatus {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  target?: number;
}
