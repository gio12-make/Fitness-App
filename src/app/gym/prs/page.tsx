'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PREntry } from '@/types';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PRsPage() {
  const [prs] = useLocalStorage<Record<string, PREntry>>('fit_prs', {});

  const entries = Object.entries(prs).sort((a, b) => {
    return new Date(b[1].dateISO).getTime() - new Date(a[1].dateISO).getTime();
  });

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      <div
        className="px-4 pt-8 pb-6"
        style={{ background: 'linear-gradient(180deg, rgba(255,214,10,0.12) 0%, transparent 100%)' }}
      >
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <Link href="/gym" className="flex items-center gap-1.5 text-[11px] font-mono text-[#44444A] hover:text-[#8E8E93] transition-colors mb-4">
            <ArrowLeft size={12} /> Back to gym
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,214,10,0.12)', border: '1px solid rgba(255,214,10,0.3)' }}>
              <Trophy size={18} className="text-[#FFD60A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">Personal Records</h1>
              <p className="text-[11px] font-mono mt-0.5 text-[#FFD60A]/60">
                {entries.length} {entries.length === 1 ? 'lift' : 'lifts'} tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#222225] p-10 flex flex-col items-center gap-3 text-center mt-2">
            <span className="text-4xl">🏋️</span>
            <p className="text-sm font-semibold text-[#44444A]">No PRs yet</p>
            <p className="text-[11px] text-[#2A2A2F] font-mono max-w-xs">
              Log a gym session and complete it — PRs are automatically detected when you beat a previous best.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden mt-2">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_60px_100px] gap-2 px-5 py-3 border-b border-[#1A1A1D]">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">Exercise</span>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] text-right">Weight</span>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] text-right">Reps</span>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] text-right">Date</span>
            </div>
            {entries.map(([exercise, pr], i) => (
              <div
                key={exercise}
                className={`grid grid-cols-[1fr_80px_60px_100px] gap-2 px-5 py-3.5 items-center ${i < entries.length - 1 ? 'border-b border-[#1A1A1D]' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-[#F5F5F7] truncate">{exercise}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-semibold text-[#FFD60A]">{pr.weight}</span>
                  <span className="text-xs text-[#44444A] ml-1">kg</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-[#8E8E93]">{pr.reps}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-[#44444A]">
                    {new Date(pr.dateISO + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
