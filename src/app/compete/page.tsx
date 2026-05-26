'use client';

import { useState } from 'react';
import { useCompetition } from '@/hooks/useCompetition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { daysUntil } from '@/lib/dateUtils';
import { USER_PROFILE } from '@/lib/constants';
import { Flame, Trophy, Target, Pencil, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

function ScoreColumn({
  name,
  score,
  streak,
  isMe,
}: {
  name: string;
  score: number;
  streak: number;
  isMe: boolean;
}) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className={clsx('flex flex-col items-center gap-3 p-4 rounded-2xl border', isMe ? 'border-[#00D4FF]/30 bg-[#00D4FF]/5' : 'border-[#2A2A2A] bg-[#111111]')}>
      {isMe && (
        <span className="text-[10px] font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
      )}
      {!isMe && (
        <span className="text-[10px] font-semibold text-[#525252] px-2 py-0.5 rounded-full uppercase tracking-wider">Opponent</span>
      )}
      <p className="text-sm font-semibold text-[#F5F5F5]">{name}</p>
      <ProgressRing percent={score} size={80} strokeWidth={6} color={color}>
        <span className="font-stat text-xl font-bold" style={{ color }}>{score}</span>
      </ProgressRing>
      <div className="flex items-center gap-1.5 text-sm">
        <Flame size={14} className="text-[#F59E0B]" />
        <span className="font-stat font-semibold text-[#F5F5F5]">{streak}</span>
        <span className="text-[#525252] text-xs">day streak</span>
      </div>
    </div>
  );
}

function AdherenceGrid({ history }: { history: { dateISO: string; score: number }[] }) {
  const last14 = history.slice(-14);
  return (
    <div className="flex gap-1 flex-wrap">
      {last14.map((d) => (
        <div
          key={d.dateISO}
          title={`${d.dateISO}: ${d.score}%`}
          className={clsx(
            'h-6 w-6 rounded-md transition-colors',
            d.score >= 80 ? 'bg-[#22C55E]' : d.score >= 60 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
          )}
        />
      ))}
      {last14.length === 0 && (
        <p className="text-xs text-[#525252]">No history yet. Start logging to see your grid.</p>
      )}
    </div>
  );
}

export default function CompetePage() {
  const {
    competition,
    myScore,
    latestMateScore,
    delta,
    getDeltaMessage,
    setMateName,
    logMateScore,
    adherence,
  } = useCompetition();

  const [editMateOpen, setEditMateOpen] = useState(false);
  const [mateName, setMateNameLocal] = useState(competition.mateName);
  const [mateScoreInput, setMateScoreInput] = useState('');
  const days = daysUntil(USER_PROFILE.deadline);

  const deltaColor = delta > 0 ? 'text-[#22C55E]' : delta < 0 ? 'text-[#EF4444]' : 'text-[#F59E0B]';
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  const saveMate = () => {
    setMateName(mateName);
    setEditMateOpen(false);
  };

  const submitMateScore = () => {
    const n = parseInt(mateScoreInput);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      logMateScore(n);
      setMateScoreInput('');
    }
  };

  const adherenceDays = adherence.history.map((d) => ({ dateISO: d.dateISO, score: d.score }));

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Beat My Mate</h1>
          <p className="text-sm text-[#525252] mt-0.5">{days} days until the deadline</p>
        </div>
        <button
          onClick={() => setEditMateOpen(true)}
          className="flex items-center gap-1.5 text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ScoreColumn name="Giorgio" score={myScore} streak={adherence.currentStreak} isMe />
        <ScoreColumn name={competition.mateName} score={latestMateScore} streak={0} isMe={false} />
      </div>

      {/* Delta banner */}
      <div className={clsx(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 mb-4',
        delta > 0 ? 'border-[#22C55E]/20 bg-[#22C55E]/5' : delta < 0 ? 'border-[#EF4444]/20 bg-[#EF4444]/5' : 'border-[#F59E0B]/20 bg-[#F59E0B]/5'
      )}>
        <DeltaIcon size={18} className={deltaColor} />
        <div className="flex-1">
          <p className={clsx('text-sm font-semibold', deltaColor)}>
            {delta > 0 ? `+${delta}` : delta} points ahead
          </p>
          <p className="text-xs text-[#A3A3A3] mt-0.5">{getDeltaMessage()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '7-Day Avg', value: myScore + '%', icon: Target, color: '#00D4FF' },
          { label: 'Best Streak', value: adherence.longestStreak + 'd', icon: Flame, color: '#F59E0B' },
          { label: 'Days Left', value: days.toString(), icon: Trophy, color: '#22C55E' },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <p className="font-stat font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-[#525252] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* My adherence history */}
      <Card className="mb-4">
        <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-3">My Last 14 Days</p>
        <AdherenceGrid history={adherenceDays} />
        <div className="flex gap-4 mt-3 text-[10px] text-[#525252]">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#22C55E] inline-block" /> ≥ 80%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#F59E0B] inline-block" /> 60–79%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#EF4444] inline-block" /> &lt; 60%</span>
        </div>
      </Card>

      {/* Update mate score */}
      <Card>
        <p className="text-xs font-medium text-[#525252] uppercase tracking-wider mb-3">Update {competition.mateName}'s Score</p>
        <div className="flex gap-2">
          <input
            value={mateScoreInput}
            onChange={(e) => setMateScoreInput(e.target.value)}
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 72"
            className="flex-1 h-10 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#525252] focus:outline-none focus:border-[#00D4FF] transition-colors"
          />
          <Button onClick={submitMateScore} size="sm" className="h-10">Log Score</Button>
        </div>
        {competition.mateScoreHistory.length > 0 && (
          <p className="text-[10px] text-[#525252] mt-2">
            Last updated: {competition.mateScoreHistory[competition.mateScoreHistory.length - 1].dateISO}
          </p>
        )}
      </Card>

      {/* Edit mate name modal */}
      <Modal open={editMateOpen} onClose={() => setEditMateOpen(false)} title="Edit Competitor">
        <div className="flex flex-col gap-3">
          <input
            value={mateName}
            onChange={(e) => setMateNameLocal(e.target.value)}
            placeholder="Your mate's name"
            className="h-12 w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#525252] focus:outline-none focus:border-[#00D4FF] transition-colors"
          />
          <Button onClick={saveMate} className="w-full">Save</Button>
        </div>
      </Modal>
    </div>
  );
}
