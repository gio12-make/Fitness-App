'use client';

import type { MuscleGroup } from '@/lib/muscleGroups';

function muscleColor(sets: number): string {
  if (sets === 0) return '#1C1C1E';
  const t = Math.min(sets / 20, 1);
  if (t < 0.5) {
    const a = (0.3 + t * 1.3).toFixed(2);
    return `rgba(10,132,255,${a})`;
  }
  const a = (0.65 + (t - 0.5) * 0.7).toFixed(2);
  return `rgba(94,92,230,${a})`;
}

export function MuscleHeatmap({ volume }: { volume: Record<MuscleGroup, number> }) {
  const c = (m: MuscleGroup) => muscleColor(volume[m]);
  const neutral = '#1A1A1D';

  return (
    <svg viewBox="0 0 210 285" className="w-full max-w-xs mx-auto block" style={{ maxHeight: 265 }}>
      {/* Labels */}
      <text x="50" y="11" textAnchor="middle" fill="#3A3A3F" fontSize="7.5" fontFamily="ui-monospace" letterSpacing="1.5">FRONT</text>
      <text x="163" y="11" textAnchor="middle" fill="#3A3A3F" fontSize="7.5" fontFamily="ui-monospace" letterSpacing="1.5">BACK</text>
      <line x1="109" y1="14" x2="109" y2="278" stroke="#222225" strokeWidth="0.8" />

      {/* ── FRONT ── */}
      {/* Head */}
      <circle cx="50" cy="29" r="13" fill={neutral} />
      {/* Neck */}
      <rect x="45" y="41" width="10" height="9" rx="2" fill={neutral} />

      {/* Left shoulder front */}
      <ellipse cx="30" cy="55" rx="11" ry="8" fill={c('shoulders')} />
      {/* Right shoulder front */}
      <ellipse cx="70" cy="55" rx="11" ry="8" fill={c('shoulders')} />
      {/* Chest */}
      <rect x="33" y="49" width="34" height="22" rx="4" fill={c('chest')} />

      {/* Left bicep */}
      <rect x="19" y="60" width="9" height="25" rx="3" fill={c('biceps')} />
      {/* Right bicep */}
      <rect x="72" y="60" width="9" height="25" rx="3" fill={c('biceps')} />

      {/* Forearms (neutral) */}
      <rect x="19" y="88" width="9" height="20" rx="3" fill={neutral} />
      <rect x="72" y="88" width="9" height="20" rx="3" fill={neutral} />

      {/* Core / abs */}
      <rect x="35" y="73" width="30" height="40" rx="4" fill={c('core')} />

      {/* Hip */}
      <rect x="31" y="115" width="38" height="9" rx="3" fill={neutral} />

      {/* Left quad */}
      <rect x="31" y="126" width="16" height="46" rx="4" fill={c('quads')} />
      {/* Right quad */}
      <rect x="53" y="126" width="16" height="46" rx="4" fill={c('quads')} />

      {/* Left shin */}
      <rect x="32" y="175" width="14" height="32" rx="3" fill={neutral} />
      {/* Right shin */}
      <rect x="54" y="175" width="14" height="32" rx="3" fill={neutral} />

      {/* Left calf */}
      <rect x="32" y="209" width="14" height="30" rx="3" fill={c('calves')} />
      {/* Right calf */}
      <rect x="54" y="209" width="14" height="30" rx="3" fill={c('calves')} />

      {/* Feet */}
      <rect x="29" y="240" width="19" height="7" rx="2" fill={neutral} />
      <rect x="52" y="240" width="19" height="7" rx="2" fill={neutral} />

      {/* ── BACK ── */}
      {/* Head */}
      <circle cx="163" cy="29" r="13" fill={neutral} />
      {/* Neck */}
      <rect x="158" y="41" width="10" height="9" rx="2" fill={neutral} />

      {/* Left shoulder rear */}
      <ellipse cx="143" cy="55" rx="11" ry="8" fill={c('shoulders')} />
      {/* Right shoulder rear */}
      <ellipse cx="183" cy="55" rx="11" ry="8" fill={c('shoulders')} />

      {/* Upper back (traps + lats) */}
      <rect x="146" y="48" width="34" height="38" rx="4" fill={c('back')} />

      {/* Left tricep */}
      <rect x="132" y="60" width="9" height="25" rx="3" fill={c('triceps')} />
      {/* Right tricep */}
      <rect x="185" y="60" width="9" height="25" rx="3" fill={c('triceps')} />

      {/* Forearms (neutral) */}
      <rect x="132" y="88" width="9" height="20" rx="3" fill={neutral} />
      <rect x="185" y="88" width="9" height="20" rx="3" fill={neutral} />

      {/* Lower back */}
      <rect x="149" y="88" width="28" height="27" rx="3" fill={c('back')} />

      {/* Glutes */}
      <rect x="145" y="117" width="36" height="27" rx="4" fill={c('glutes')} />

      {/* Left hamstring */}
      <rect x="145" y="146" width="16" height="48" rx="4" fill={c('hamstrings')} />
      {/* Right hamstring */}
      <rect x="165" y="146" width="16" height="48" rx="4" fill={c('hamstrings')} />

      {/* Left calf back */}
      <rect x="146" y="196" width="14" height="43" rx="3" fill={c('calves')} />
      {/* Right calf back */}
      <rect x="166" y="196" width="14" height="43" rx="3" fill={c('calves')} />

      {/* Feet */}
      <rect x="143" y="240" width="19" height="7" rx="2" fill={neutral} />
      <rect x="166" y="240" width="19" height="7" rx="2" fill={neutral} />
    </svg>
  );
}
