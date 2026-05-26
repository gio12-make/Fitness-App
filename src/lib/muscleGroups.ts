export type MuscleGroup =
  | 'chest' | 'shoulders' | 'triceps' | 'biceps'
  | 'back' | 'quads' | 'hamstrings' | 'glutes' | 'core' | 'calves';

const MUSCLE_MAP: Record<MuscleGroup, string[]> = {
  chest:      ['bench', 'fly', 'flye', 'pec', 'chest press', 'push up', 'pushup'],
  shoulders:  ['shoulder', 'overhead', 'lateral raise', 'military', 'arnold', 'front raise', 'ohp'],
  triceps:    ['tricep', 'dip', 'pushdown', 'extension', 'skullcrusher', 'close grip'],
  biceps:     ['bicep', 'curl', 'chin up', 'chinup', 'hammer'],
  back:       ['row', 'deadlift', 'pull up', 'pullup', 'pulldown', 'lat', 'rdl', 'back', 'cable pull'],
  quads:      ['squat', 'leg press', 'lunge', 'quad', 'leg extension', 'hack'],
  hamstrings: ['hamstring', 'leg curl', 'rdl', 'romanian', 'good morning'],
  glutes:     ['glute', 'hip thrust', 'abduction', 'kickback'],
  core:       ['crunch', 'plank', 'ab ', 'abs', 'core', 'twist', 'sit up', 'situp', 'cable crunch', 'leg raise'],
  calves:     ['calf', 'raise', 'standing raise', 'seated raise'],
};

// Equivalent "sets" each cardio type contributes to muscle groups
const CARDIO_MUSCLE_MAP: Record<string, Partial<Record<MuscleGroup, number>>> = {
  Walk:  { quads: 3, hamstrings: 2, glutes: 2, calves: 3 },
  Run:   { quads: 5, hamstrings: 4, glutes: 3, calves: 5, core: 2 },
  LISS:  { quads: 3, hamstrings: 2, glutes: 2, calves: 3 },
  HIIT:  { quads: 5, hamstrings: 4, glutes: 4, calves: 4, core: 4 },
  Cycle: { quads: 6, hamstrings: 3, glutes: 3, calves: 2 },
  Other: { quads: 2, hamstrings: 2, glutes: 2, calves: 2 },
};

export function musclesWorked(exerciseName: string): MuscleGroup[] {
  const lower = exerciseName.toLowerCase();
  return (Object.entries(MUSCLE_MAP) as [MuscleGroup, string[]][])
    .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
    .map(([group]) => group);
}

interface SetLog { weight: number | ''; reps: number | ''; }
interface ExerciseLog { name: string; sets: SetLog[]; }
interface CardioDetails { type: string; duration?: number; }
interface GymSession { exercises: ExerciseLog[]; completedAt: number | null; cardioDetails?: CardioDetails; }

export function weeklyMuscleVolume(sessions: (GymSession | null)[]): Record<MuscleGroup, number> {
  const vol: Record<MuscleGroup, number> = {
    chest: 0, shoulders: 0, triceps: 0, biceps: 0,
    back: 0, quads: 0, hamstrings: 0, glutes: 0, core: 0, calves: 0,
  };
  for (const s of sessions) {
    if (!s?.completedAt) continue;
    // Strength exercises
    for (const ex of s.exercises) {
      const muscles = musclesWorked(ex.name);
      const sets = ex.sets.filter(set => set.reps !== '' && Number(set.reps) > 0).length;
      for (const m of muscles) vol[m] += sets;
    }
    // Cardio contribution
    if (s.cardioDetails?.type) {
      const contribution = CARDIO_MUSCLE_MAP[s.cardioDetails.type];
      if (contribution) {
        for (const [m, v] of Object.entries(contribution) as [MuscleGroup, number][]) {
          vol[m] += v;
        }
      }
    }
  }
  return vol;
}
