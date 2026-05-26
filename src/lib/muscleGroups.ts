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
  Walk:       { quads: 3, hamstrings: 2, glutes: 2, calves: 3 },
  Run:        { quads: 5, hamstrings: 4, glutes: 3, calves: 5, core: 2 },
  LISS:       { quads: 3, hamstrings: 2, glutes: 2, calves: 3 },
  HIIT:       { quads: 5, hamstrings: 4, glutes: 4, calves: 4, core: 4 },
  Cycle:      { quads: 6, hamstrings: 3, glutes: 3, calves: 2 },
  Football:   { quads: 6, hamstrings: 5, glutes: 4, calves: 6, core: 3 },
  Tennis:     { quads: 3, hamstrings: 2, calves: 2, glutes: 2, shoulders: 4, biceps: 2, triceps: 2, core: 3 },
  Basketball: { quads: 5, hamstrings: 3, glutes: 3, calves: 5, core: 2, shoulders: 2 },
  Swimming:   { shoulders: 6, back: 5, triceps: 3, biceps: 2, core: 4 },
  Golf:       { core: 4, back: 3, shoulders: 3, glutes: 2, quads: 2, calves: 2 },
  Other:      { quads: 2, hamstrings: 2, glutes: 2, calves: 2 },
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

// Max sets before a muscle hits full red — lower = more sensitive
const MUSCLE_MAX: Record<MuscleGroup, number> = {
  chest: 16, shoulders: 16, triceps: 14, biceps: 14,
  back: 18, quads: 20, hamstrings: 18, glutes: 18, core: 16, calves: 20,
};

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
    // Cardio / sport contribution
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

export { MUSCLE_MAX };
