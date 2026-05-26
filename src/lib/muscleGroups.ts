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

export function musclesWorked(exerciseName: string): MuscleGroup[] {
  const lower = exerciseName.toLowerCase();
  return (Object.entries(MUSCLE_MAP) as [MuscleGroup, string[]][])
    .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
    .map(([group]) => group);
}

interface SetLog { weight: number | ''; reps: number | ''; }
interface ExerciseLog { name: string; sets: SetLog[]; }
interface GymSession { exercises: ExerciseLog[]; completedAt: number | null; }

export function weeklyMuscleVolume(sessions: (GymSession | null)[]): Record<MuscleGroup, number> {
  const vol: Record<MuscleGroup, number> = {
    chest: 0, shoulders: 0, triceps: 0, biceps: 0,
    back: 0, quads: 0, hamstrings: 0, glutes: 0, core: 0, calves: 0,
  };
  for (const s of sessions) {
    if (!s?.completedAt) continue;
    for (const ex of s.exercises) {
      const muscles = musclesWorked(ex.name);
      const sets = ex.sets.filter(set => set.reps !== '' && Number(set.reps) > 0).length;
      for (const m of muscles) vol[m] += sets;
    }
  }
  return vol;
}
