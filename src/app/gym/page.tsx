'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { todayISO } from '@/lib/dateUtils';
import { weeklyMuscleVolume } from '@/lib/muscleGroups';
import { MuscleHeatmap } from '@/components/ui/MuscleHeatmap';
import type { WorkoutTemplate, PREntry, CardioDetails } from '@/types';
import { Dumbbell, Plus, Trash2, Check, Wind, ChevronDown, X, Save, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface SetLog { weight: number | ''; reps: number | ''; }
interface ExerciseLog { id: string; name: string; sets: SetLog[]; }
interface GymSessionLog {
  dateISO: string;
  exercises: ExerciseLog[];
  feel: number;
  notes: string;
  completedAt: number | null;
  cardioDetails?: CardioDetails;
  prsBeaten?: string[];
}

const FEEL_OPTIONS = [
  { v: 1, label: 'Rough',  emoji: '😴', color: '#FF453A' },
  { v: 2, label: 'Low',    emoji: '😕', color: '#FF9F0A' },
  { v: 3, label: 'OK',     emoji: '😐', color: '#FFD60A' },
  { v: 4, label: 'Strong', emoji: '💪', color: '#30D158' },
  { v: 5, label: 'Beast',  emoji: '🔥', color: '#0A84FF' },
];

const CARDIO_TYPES: CardioDetails['type'][] = ['LISS', 'HIIT', 'Run', 'Cycle', 'Walk', 'Other'];

const defaultSession = (dateISO: string): GymSessionLog => ({
  dateISO, exercises: [], feel: 0, notes: '', completedAt: null,
});

export default function GymPage() {
  const today = todayISO();
  const { todayPlan } = useWeeklyPlan();
  const [session, setSession] = useLocalStorage<GymSessionLog>(`fit_gym_${today}`, defaultSession(today));
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>('fit_templates', []);
  const [prs, setPrs] = useLocalStorage<Record<string, PREntry>>('fit_prs', {});

  const [newExName, setNewExName] = useState('');
  const [newPRs, setNewPRs] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const sessionType = todayPlan?.sessionType ?? 'rest';
  const sessionColor = sessionType === 'gym' ? '#0A84FF' : sessionType === 'cardio' ? '#30D158' : '#3A3A3F';
  const gradFrom = sessionType === 'gym' ? 'rgba(10,132,255,0.18)' : sessionType === 'cardio' ? 'rgba(48,209,88,0.18)' : 'rgba(58,58,63,0.15)';

  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const weekSessions = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return weekDates.map(date => {
      if (date === today) return session;
      try {
        const raw = localStorage.getItem(`fit_gym_${date}`);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    });
  }, [weekDates, today, session]);

  const muscleVol = useMemo(() => weeklyMuscleVolume(weekSessions), [weekSessions]);

  const addExercise = () => {
    if (!newExName.trim()) return;
    const ex: ExerciseLog = { id: Date.now().toString(), name: newExName.trim(), sets: [{ weight: '', reps: '' }] };
    setSession(s => ({ ...s, exercises: [...s.exercises, ex] }));
    setNewExName('');
  };

  const removeExercise = (id: string) =>
    setSession(s => ({ ...s, exercises: s.exercises.filter(e => e.id !== id) }));

  const addSet = (exId: string) =>
    setSession(s => ({
      ...s,
      exercises: s.exercises.map(e => e.id === exId ? { ...e, sets: [...e.sets, { weight: '', reps: '' }] } : e),
    }));

  const updateSet = (exId: string, si: number, field: 'weight' | 'reps', val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    setSession(s => ({
      ...s,
      exercises: s.exercises.map(e =>
        e.id === exId ? { ...e, sets: e.sets.map((set, i) => i === si ? { ...set, [field]: num } : set) } : e
      ),
    }));
  };

  const loadTemplate = (t: WorkoutTemplate) => {
    const exercises: ExerciseLog[] = t.exercises.map(e => ({
      id: `${Date.now()}-${Math.random()}`,
      name: e.name,
      sets: Array.from({ length: e.defaultSets }, () => ({ weight: '', reps: '' })),
    }));
    setSession(s => ({ ...s, exercises }));
    setShowTemplateMenu(false);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const t: WorkoutTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      exercises: session.exercises.map(e => ({ name: e.name, defaultSets: e.sets.length })),
      createdAt: Date.now(),
    };
    setTemplates(ts => [...ts, t]);
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  const deleteTemplate = (id: string) => setTemplates(ts => ts.filter(t => t.id !== id));

  const STEPS_PER_KM = 1350;

  const updateCardio = (patch: Partial<CardioDetails>) =>
    setSession(s => ({
      ...s,
      cardioDetails: { ...(s.cardioDetails ?? { duration: 0, type: 'Run' as const }), ...patch },
    }));

  const handleCardioDistance = (val: string) => {
    const km = parseFloat(val);
    if (!val || isNaN(km)) { updateCardio({ distance: undefined, steps: undefined }); return; }
    updateCardio({ distance: km, steps: Math.round(km * STEPS_PER_KM) });
  };

  const handleCardioSteps = (val: string) => {
    const steps = parseInt(val, 10);
    if (!val || isNaN(steps)) { updateCardio({ steps: undefined, distance: undefined }); return; }
    updateCardio({ steps, distance: Math.round((steps / STEPS_PER_KM) * 100) / 100 });
  };

  const completeSession = () => {
    if (session.completedAt) {
      setSession(s => ({ ...s, completedAt: null }));
      setNewPRs([]);
      return;
    }
    const beaten: string[] = [];
    const updatedPRs = { ...prs };
    for (const ex of session.exercises) {
      const valid = ex.sets.filter(s => s.reps !== '' && Number(s.reps) > 0 && s.weight !== '' && Number(s.weight) > 0);
      if (valid.length === 0) continue;
      const maxW = Math.max(...valid.map(s => Number(s.weight)));
      const best = valid.filter(s => Number(s.weight) === maxW)[0];
      const existing = updatedPRs[ex.name];
      if (!existing || maxW > existing.weight) {
        updatedPRs[ex.name] = { weight: maxW, reps: Number(best.reps), dateISO: today };
        beaten.push(ex.name);
      }
    }
    if (beaten.length > 0) {
      setPrs(updatedPRs);
      setNewPRs(beaten);
    }
    setSession(s => ({ ...s, completedAt: Date.now(), prsBeaten: beaten }));
  };

  const cardio = session.cardioDetails;
  const pace = cardio?.duration && cardio.distance && cardio.distance > 0
    ? (cardio.duration / cardio.distance).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-4 pt-8 pb-6" style={{ background: `linear-gradient(180deg, ${gradFrom} 0%, transparent 100%)` }}>
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-1.5" style={{ color: `${sessionColor}90` }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${sessionColor}20`, border: `1px solid ${sessionColor}40` }}>
                {sessionType === 'cardio' ? <Wind size={18} style={{ color: sessionColor }} /> : <Dumbbell size={18} style={{ color: sessionColor }} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">
                  {todayPlan?.sessionLabel ?? 'Active Rest'}
                </h1>
                <p className="text-[11px] font-mono mt-0.5" style={{ color: `${sessionColor}70` }}>
                  {sessionType === 'gym' ? 'Log your lifts' : sessionType === 'cardio' ? 'Log your session' : 'Rest & recover'}
                </p>
              </div>
            </div>
            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#222225] bg-[#111113] text-[11px] font-semibold text-[#8E8E93] hover:text-[#F5F5F7] transition-colors"
                  >
                    Load <ChevronDown size={11} />
                  </button>
                  {showTemplateMenu && (
                    <div className="absolute right-0 top-9 z-20 w-48 rounded-xl bg-[#1C1C1E] border border-[#2A2A2F] shadow-xl overflow-hidden">
                      {templates.map(t => (
                        <button
                          key={t.id}
                          onClick={() => loadTemplate(t)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#F5F5F7] hover:bg-[#2A2A2F] transition-colors border-b border-[#222225] last:border-0"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/gym/prs"
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#222225] bg-[#111113] text-[11px] font-semibold text-[#8E8E93] hover:text-[#FFD60A] transition-colors"
              >
                <Trophy size={11} /> PRs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4 flex flex-col gap-3">

        {/* Cardio details card */}
        {sessionType === 'cardio' && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-4">Cardio Session</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {CARDIO_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => updateCardio({ type })}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
                  style={cardio?.type === type
                    ? { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: 'rgba(48,209,88,0.4)', color: '#30D158' }
                    : { borderColor: '#222225', color: '#44444A', backgroundColor: '#0E0E10' }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Duration */}
              <div>
                <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Duration (min)</p>
                <input
                  type="number"
                  value={cardio?.duration || ''}
                  onChange={e => updateCardio({ duration: parseFloat(e.target.value) || 0 })}
                  placeholder="—"
                  className="h-9 w-full rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#30D158]/50"
                />
              </div>
              {/* Distance */}
              <div>
                <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Distance (km)</p>
                <input
                  type="number"
                  value={cardio?.distance ?? ''}
                  onChange={e => handleCardioDistance(e.target.value)}
                  placeholder="—"
                  className="h-9 w-full rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#30D158]/50"
                />
              </div>
              {/* Steps */}
              <div>
                <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Steps</p>
                <input
                  type="number"
                  value={cardio?.steps ?? ''}
                  onChange={e => handleCardioSteps(e.target.value)}
                  placeholder="—"
                  className="h-9 w-full rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#30D158]/50"
                />
              </div>
              {/* Avg HR */}
              <div>
                <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Avg HR (bpm)</p>
                <input
                  type="number"
                  value={cardio?.avgHR ?? ''}
                  onChange={e => updateCardio({ avgHR: parseFloat(e.target.value) || undefined })}
                  placeholder="—"
                  className="h-9 w-full rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#30D158]/50"
                />
              </div>
            </div>
            {(pace || (cardio?.steps && cardio.distance)) && (
              <div className="mt-3 flex gap-4 text-xs font-mono text-[#44444A]">
                {pace && <p>Pace: <span className="text-[#30D158] font-semibold">{pace} min/km</span></p>}
                {cardio?.steps && cardio.distance && (
                  <p>≈ <span className="text-[#30D158] font-semibold">{STEPS_PER_KM} steps/km</span></p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Feel rating */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-4">Session feel</p>
          <div className="flex gap-2">
            {FEEL_OPTIONS.map(opt => (
              <button
                key={opt.v}
                onClick={() => setSession(s => ({ ...s, feel: opt.v }))}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all"
                style={session.feel === opt.v
                  ? { backgroundColor: `${opt.color}15`, borderColor: `${opt.color}45` }
                  : { borderColor: '#222225', backgroundColor: '#0E0E10' }}
              >
                <span className="text-[22px] leading-none">{opt.emoji}</span>
                <span className="text-[9px] font-semibold" style={{ color: session.feel === opt.v ? opt.color : '#44444A' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* New PRs banner */}
        {newPRs.length > 0 && (
          <div className="rounded-2xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 p-4 flex items-center gap-3">
            <span className="text-xl shrink-0">🏆</span>
            <div>
              <p className="text-sm font-semibold text-[#FFD60A]">New PR{newPRs.length > 1 ? 's' : ''} set!</p>
              <p className="text-xs text-[#8E8E93] mt-0.5">{newPRs.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Exercise cards */}
        {session.exercises.map(ex => {
          const isPR = session.prsBeaten?.includes(ex.name) || newPRs.includes(ex.name);
          const existingPR = prs[ex.name];
          return (
            <div key={ex.id} className="rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A1D]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-[#F5F5F7] text-sm truncate">{ex.name}</span>
                  {isPR && <span className="text-sm shrink-0">🏆</span>}
                  {existingPR && !isPR && (
                    <span className="text-[9px] font-mono text-[#44444A] shrink-0">PR {existingPR.weight}kg</span>
                  )}
                </div>
                <button onClick={() => removeExercise(ex.id)} className="text-[#44444A] hover:text-[#FF453A] transition-colors p-1 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="grid grid-cols-[32px_1fr_1fr] gap-2 px-1 mb-1">
                  <span className="text-[9px] font-semibold text-[#44444A] tracking-wider uppercase text-center">SET</span>
                  <span className="text-[9px] font-semibold text-[#44444A] tracking-wider uppercase text-center">KG</span>
                  <span className="text-[9px] font-semibold text-[#44444A] tracking-wider uppercase text-center">REPS</span>
                </div>
                {ex.sets.map((set, si) => (
                  <div key={si} className="grid grid-cols-[32px_1fr_1fr] gap-2 items-center">
                    <span className="font-mono text-xs text-[#44444A] text-center">{si + 1}</span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={e => updateSet(ex.id, si, 'weight', e.target.value)}
                      placeholder="—"
                      className="h-9 rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#0A84FF]/50"
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={e => updateSet(ex.id, si, 'reps', e.target.value)}
                      placeholder="—"
                      className="h-9 rounded-lg bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#0A84FF]/50"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addSet(ex.id)}
                  className="mt-1 flex items-center gap-1 text-[11px] font-semibold transition-colors self-start pl-1"
                  style={{ color: sessionColor }}
                >
                  <Plus size={12} /> Add set
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {session.exercises.length === 0 && sessionType !== 'cardio' && (
          <div className="rounded-2xl border border-dashed border-[#222225] p-6 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-semibold text-[#44444A]">No exercises logged yet</p>
            <p className="text-[11px] text-[#2A2A2F] font-mono">Type an exercise below and hit + to add it</p>
          </div>
        )}

        {/* Add exercise */}
        <div className="flex gap-2">
          <input
            value={newExName}
            onChange={e => setNewExName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExercise()}
            placeholder="Add exercise (e.g. Bench Press)"
            className="flex-1 h-11 rounded-xl bg-[#111113] border border-[#222225] px-4 text-sm text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#0A84FF]/50"
          />
          <button
            onClick={addExercise}
            className="h-11 w-11 rounded-xl font-semibold text-white flex items-center justify-center shrink-0 transition-opacity hover:opacity-85"
            style={{
              background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
              boxShadow: '0 2px 14px rgba(10,132,255,0.35)',
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Templates section */}
        {session.exercises.length > 0 && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] p-4">
            {templates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2F] text-[11px] text-[#8E8E93]">
                    {t.name}
                    <button onClick={() => deleteTemplate(t.id)} className="hover:text-[#FF453A] transition-colors ml-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showSaveTemplate ? (
              <div className="flex gap-2">
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                  placeholder="Template name..."
                  autoFocus
                  className="flex-1 h-9 rounded-lg bg-[#0E0E10] border border-[#222225] px-3 text-sm text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#0A84FF]/50"
                />
                <button onClick={saveTemplate} className="h-9 px-3 rounded-lg bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#0A84FF] text-[11px] font-semibold hover:bg-[#0A84FF]/30 transition-colors">
                  Save
                </button>
                <button onClick={() => setShowSaveTemplate(false)} className="h-9 px-2 rounded-lg text-[#44444A] hover:text-[#8E8E93] transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveTemplate(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#44444A] hover:text-[#8E8E93] transition-colors"
              >
                <Save size={11} /> Save as template
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-3">Session notes</p>
          <textarea
            value={session.notes}
            onChange={e => setSession(s => ({ ...s, notes: e.target.value }))}
            placeholder="How did it go? PRs, form notes, energy levels..."
            rows={4}
            className="w-full bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#2A2A2F] resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Complete */}
        <button
          onClick={completeSession}
          className={clsx(
            'w-full h-[52px] rounded-2xl font-semibold text-sm transition-all',
            session.completedAt
              ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
              : 'text-white'
          )}
          style={!session.completedAt ? {
            background: 'linear-gradient(135deg, #30D158 0%, #0A84FF 100%)',
            boxShadow: '0 4px 22px rgba(48,209,88,0.28)',
          } : {}}
        >
          {session.completedAt
            ? <span className="flex items-center justify-center gap-2"><Check size={15} /> Session Logged</span>
            : 'Complete Session'}
        </button>

        {/* Muscle heatmap */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">This week&apos;s muscle activity</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#1C1C1E', border: '1px solid #2A2A2F' }} />
              <span className="text-[9px] font-mono text-[#44444A]">rest</span>
              <div className="h-2 w-8 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(10,132,255,0.6), rgba(94,92,230,1))' }} />
              <span className="text-[9px] font-mono text-[#44444A]">trained</span>
            </div>
          </div>
          <MuscleHeatmap volume={muscleVol} />
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
