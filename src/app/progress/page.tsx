'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useProgress } from '@/hooks/useProgress';
import { useProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { formatShortDate, formatDisplayDate, todayISO } from '@/lib/dateUtils';
import { Camera, Trash2, TrendingDown, Dumbbell, Wind, Footprints, Scale, ChevronRight } from 'lucide-react';
import { USER_PROFILE } from '@/lib/constants';
import type { CardioDetails } from '@/types';

interface GymSessionLog {
  dateISO: string;
  exercises: { id: string; name: string; sets: { weight: number | ''; reps: number | '' }[] }[];
  feel: number;
  notes: string;
  completedAt: number | null;
  cardioDetails?: CardioDetails;
  prsBeaten?: string[];
}

interface DayDiaryEntry {
  dateISO: string;
  gymSession: GymSessionLog | null;
  weightKg: number | null;
  stepsCount: number | null;
}

function useDiary(days = 60): DayDiaryEntry[] {
  const [entries, setEntries] = useState<DayDiaryEntry[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date();
    const result: DayDiaryEntry[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateISO = d.toISOString().split('T')[0];
      let gymSession: GymSessionLog | null = null;
      let weightKg: number | null = null;
      let stepsCount: number | null = null;
      try {
        const raw = localStorage.getItem(`fit_gym_${dateISO}`);
        if (raw) gymSession = JSON.parse(raw);
      } catch { /* skip */ }
      try {
        const raw = localStorage.getItem(`fit_log_${dateISO}`);
        if (raw) {
          const log = JSON.parse(raw);
          weightKg = log.weightKg ?? null;
          stepsCount = log.stepsCount ?? null;
        }
      } catch { /* skip */ }
      const hasData = gymSession?.completedAt || gymSession?.cardioDetails?.duration ||
        gymSession?.exercises?.length || weightKg || stepsCount;
      if (hasData) result.push({ dateISO, gymSession, weightKg, stepsCount });
    }
    setEntries(result);
  }, [days]);
  return entries;
}

function LineChart({
  data,
  color,
  unit,
  height = 100,
}: {
  data: { date: string; value: number }[];
  color: string;
  unit: string;
  height?: number;
}) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-24 text-xs text-[#525252]">
      Log at least 2 entries to see your chart
    </div>
  );

  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const range = max - min || 1;
  const W = 300;
  const H = height;
  const pad = { top: 8, bottom: 8, left: 4, right: 4 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => pad.top + (1 - (v - min) / range) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');

  const lastVal = vals[vals.length - 1];
  const firstVal = vals[0];
  const delta = +(lastVal - firstVal).toFixed(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-stat text-2xl font-bold text-[#F5F5F5]">{lastVal}{unit}</span>
        <span className={`text-sm font-semibold font-stat ${delta <= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {delta > 0 ? '+' : ''}{delta}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
        {data.map((d, i) => (
          <circle key={d.date} cx={toX(i)} cy={toY(d.value)} r="3" fill={color} />
        ))}
        {/* x-axis labels for first and last */}
        <text x={toX(0)} y={H} textAnchor="middle" fill="#525252" fontSize="8">{formatShortDate(data[0].date)}</text>
        <text x={toX(data.length - 1)} y={H} textAnchor="middle" fill="#525252" fontSize="8">{formatShortDate(data[data.length - 1].date)}</text>
      </svg>
    </div>
  );
}

const FEEL_LABELS = ['', '😴 Rough', '😕 Low', '😐 OK', '💪 Strong', '🔥 Beast'];
const FEEL_COLORS = ['', '#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#0A84FF'];

export default function ProgressPage() {
  const { log, setWeight, setWaist } = useDailyLog();
  const { photos, weightHistory, waistHistory, addPhoto, deletePhoto } = useProgress();
  const { profile } = useProfile();
  const diary = useDiary(60);

  const [weightInput, setWeightInput] = useState(log.weightKg?.toString() ?? '');
  const [waistInput, setWaistInput] = useState(log.waistCm?.toString() ?? '');
  const [photoNote, setPhotoNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleWeightSave = () => {
    const n = parseFloat(weightInput);
    if (!isNaN(n)) setWeight(n);
  };

  const handleWaistSave = () => {
    const n = parseFloat(waistInput);
    if (!isNaN(n)) setWaist(n);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await addPhoto(file, photoNote);
    setPhotoNote('');
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const today = todayISO();
  const startWeight = profile?.startWeight ?? USER_PROFILE.startWeight;
  const goalWeight = profile?.goalWeightKg ?? null;
  const currentWeight = log.weightKg ?? (weightHistory[weightHistory.length - 1]?.weight ?? startWeight);
  const lost = +(startWeight - currentWeight).toFixed(1);

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#F5F5F5]">Progress</h1>
        <p className="text-sm text-[#525252] mt-0.5">Track your transformation</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Start', value: startWeight + 'kg', color: 'text-[#A3A3A3]' },
          { label: 'Current', value: (log.weightKg ?? '--') + (log.weightKg ? 'kg' : ''), color: 'text-[#F5F5F5]' },
          { label: 'Target', value: goalWeight ? `${goalWeight}kg` : '—', color: 'text-[#00D4FF]' },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <p className={`font-stat font-bold text-lg ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-[#525252] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {lost > 0 && (
        <div className="flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl px-4 py-3 mb-4">
          <TrendingDown size={16} className="text-[#22C55E]" />
          <span className="text-sm font-semibold text-[#22C55E]">You've lost {lost}kg since starting. Keep going!</span>
        </div>
      )}

      {/* Log today's metrics */}
      <Card className="mb-4">
        <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-3">Log Today</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">Weight (kg)</label>
            <div className="flex gap-2">
              <input
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                type="number"
                step="0.1"
                placeholder="74.2"
                className="flex-1 h-10 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-[#F5F5F5] placeholder:text-[#525252] focus:outline-none focus:border-[#00D4FF] transition-colors"
              />
              <button onClick={handleWeightSave} className="h-10 px-3 rounded-xl border border-[#2A2A2A] text-xs text-[#A3A3A3] hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors">
                Save
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">Waist (cm)</label>
            <div className="flex gap-2">
              <input
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                type="number"
                step="0.5"
                placeholder="80"
                className="flex-1 h-10 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-[#F5F5F5] placeholder:text-[#525252] focus:outline-none focus:border-[#00D4FF] transition-colors"
              />
              <button onClick={handleWaistSave} className="h-10 px-3 rounded-xl border border-[#2A2A2A] text-xs text-[#A3A3A3] hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Weight chart */}
      <Card className="mb-4">
        <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-3">Weight Trend</p>
        <LineChart
          data={weightHistory.map((w) => ({ date: w.date, value: w.weight }))}
          color="#00D4FF"
          unit="kg"
          height={100}
        />
      </Card>

      {/* Waist chart */}
      {waistHistory.length >= 2 && (
        <Card className="mb-4">
          <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-3">Waist Trend</p>
          <LineChart
            data={waistHistory.map((w) => ({ date: w.date, value: w.waist }))}
            color="#A855F7"
            unit="cm"
            height={80}
          />
        </Card>
      )}

      {/* Session Diary */}
      <Card className="mb-4">
        <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-4">Session Diary</p>
        {diary.length === 0 ? (
          <p className="text-sm text-[#525252] text-center py-4">No sessions logged yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#1A1A1A]">
            {diary.map(({ dateISO, gymSession, weightKg, stepsCount }) => {
              const hasExercises = gymSession?.exercises && gymSession.exercises.length > 0;
              const hasCardio = gymSession?.cardioDetails?.duration;
              const isGym = hasExercises;
              const isCardio = !hasExercises && hasCardio;
              const sessionColor = isGym ? '#0A84FF' : isCardio ? '#30D158' : '#8E8E93';
              return (
                <Link key={dateISO} href={`/plan/${dateISO}`} className="group flex flex-col gap-2.5 py-4 first:pt-0 last:pb-0">
                  {/* Day header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${sessionColor}15`, border: `1px solid ${sessionColor}30` }}>
                        {isGym ? <Dumbbell size={11} style={{ color: sessionColor }} /> :
                         isCardio ? <Wind size={11} style={{ color: sessionColor }} /> :
                         <Scale size={11} style={{ color: sessionColor }} />}
                      </div>
                      <span className="text-sm font-semibold text-[#F5F5F5]">{formatDisplayDate(dateISO)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {gymSession?.feel ? (
                        <span className="text-[10px] font-semibold" style={{ color: FEEL_COLORS[gymSession.feel] }}>
                          {FEEL_LABELS[gymSession.feel]}
                        </span>
                      ) : null}
                      <ChevronRight size={12} className="text-[#3A3A3A] group-hover:text-[#525252] transition-colors" />
                    </div>
                  </div>

                  {/* Exercises */}
                  {hasExercises && gymSession?.exercises.map(ex => {
                    const validSets = ex.sets.filter(s => s.weight !== '' && s.reps !== '');
                    const maxWeight = validSets.length > 0
                      ? Math.max(...validSets.map(s => Number(s.weight)))
                      : null;
                    const isPR = gymSession.prsBeaten?.includes(ex.name);
                    return (
                      <div key={ex.id} className="flex items-center justify-between pl-8">
                        <span className="text-xs text-[#A3A3A3] truncate flex-1">{ex.name}</span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#525252] shrink-0 ml-2">
                          {validSets.length > 0 && <span>{validSets.length} sets</span>}
                          {maxWeight !== null && <span className="text-[#0A84FF]">{maxWeight}kg</span>}
                          {isPR && <span className="text-[#FFD60A]">🏆 PR</span>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Cardio details */}
                  {hasCardio && gymSession?.cardioDetails && (
                    <div className="pl-8 flex flex-wrap gap-3 text-[10px] font-mono">
                      <span className="text-[#30D158] font-semibold">{gymSession.cardioDetails.type}</span>
                      <span className="text-[#525252]">{gymSession.cardioDetails.duration} min</span>
                      {gymSession.cardioDetails.distance && (
                        <span className="text-[#525252]">{gymSession.cardioDetails.distance} km</span>
                      )}
                      {gymSession.cardioDetails.steps && (
                        <span className="text-[#525252]">{gymSession.cardioDetails.steps.toLocaleString()} steps</span>
                      )}
                      {gymSession.cardioDetails.avgHR && (
                        <span className="text-[#525252]">{gymSession.cardioDetails.avgHR} bpm</span>
                      )}
                      {gymSession.cardioDetails.duration && gymSession.cardioDetails.distance && (
                        <span className="text-[#525252]">
                          {(gymSession.cardioDetails.duration / gymSession.cardioDetails.distance).toFixed(1)} min/km
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body stats */}
                  {(weightKg || stepsCount) && (
                    <div className="pl-8 flex gap-4">
                      {weightKg && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#525252]">
                          <Scale size={9} className="text-[#44444A]" /> {weightKg}kg
                        </span>
                      )}
                      {stepsCount && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#525252]">
                          <Footprints size={9} className="text-[#44444A]" /> {stepsCount.toLocaleString()} steps
                        </span>
                      )}
                    </div>
                  )}

                  {/* Session notes */}
                  {gymSession?.notes?.trim() && (
                    <p className="pl-8 text-xs text-[#525252] italic leading-relaxed">
                      &ldquo;{gymSession.notes.trim()}&rdquo;
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Progress photos */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[#525252] uppercase tracking-wider">Progress Photos</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-[#00D4FF] hover:text-[#0099BB] transition-colors"
            disabled={uploading}
          >
            <Camera size={13} />
            {uploading ? 'Uploading…' : 'Add Photo'}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {photos.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-[#2A2A2A] cursor-pointer hover:border-[#3A3A3A] transition-colors"
          >
            <Camera size={24} className="text-[#3A3A3A]" />
            <p className="text-xs text-[#525252]">Tap to add your first progress photo</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.dataUrl}
                  alt={photo.note || photo.dateISO}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <p className="text-[10px] text-white font-medium">{formatShortDate(photo.dateISO)}</p>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="flex items-center gap-1 text-[10px] text-[#EF4444]"
                  >
                    <Trash2 size={10} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-square flex items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] cursor-pointer hover:border-[#3A3A3A] transition-colors"
            >
              <Camera size={20} className="text-[#3A3A3A]" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
