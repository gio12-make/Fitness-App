'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { GenerativeArtScene } from '@/components/ui/anomalous-matter-hero';
import { daysUntil } from '@/lib/dateUtils';
import { USER_PROFILE } from '@/lib/constants';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { ArrowRight } from 'lucide-react';

function ChallengeRing({ percent, days }: { percent: number; days: number }) {
  const size = 228;
  const stroke = 15;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(percent, 0), 100) / 100) * circ;
  const cx = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center animate-enter"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="homeRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0A84FF" />
            <stop offset="100%" stopColor="#5E5CE6" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} />
        {/* Glow */}
        {percent > 0.5 && (
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#0A84FF" strokeWidth={stroke + 10}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ opacity: 0.14, filter: 'blur(8px)' }}
          />
        )}
        {/* Arc */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#homeRingGrad)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[56px] font-bold text-white leading-none">{days}</span>
        <span className="text-[10px] text-white/35 font-mono uppercase tracking-[0.18em] mt-1.5">days left</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const days = daysUntil(USER_PROFILE.deadline);
  const totalDays = differenceInCalendarDays(parseISO(USER_PROFILE.deadline), parseISO(USER_PROFILE.startDate));
  const elapsed = Math.max(0, totalDays - days);
  const dayNumber = elapsed + 1;
  const percent = totalDays > 0 ? (dayNumber / totalDays) * 100 : 0;

  return (
    <div className="relative w-full h-screen bg-[#080808] overflow-hidden flex items-center justify-center">
      {/* Shader background */}
      <Suspense fallback={null}>
        <GenerativeArtScene />
      </Suspense>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/30 via-transparent to-[#080808]/75 z-10 pointer-events-none" />

      {/* Radial dark backdrop so the ring is readable over the shader */}
      <div
        className="absolute pointer-events-none"
        style={{ zIndex: 15,
          width: 380, height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,8,8,0.55) 45%, transparent 75%)',
        }}
      />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6">
        <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/50 mb-10 animate-enter">
          Challenge Active
        </p>

        <ChallengeRing percent={percent} days={days} />

        <div className="mt-8 animate-enter" style={{ animationDelay: '150ms' }}>
          <h1 className="text-[42px] md:text-5xl font-bold text-white tracking-tight leading-none">
            Abs by August
          </h1>
          <p className="text-sm text-white/50 font-mono mt-3">
            Day {dayNumber} of {totalDays} · Deadline 1 Aug 2026
          </p>
        </div>

        <div className="mt-10 animate-enter" style={{ animationDelay: '280ms' }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-7 h-12 rounded-2xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
              boxShadow: '0 0 32px rgba(10, 132, 255, 0.4)',
            }}
          >
            Enter Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
