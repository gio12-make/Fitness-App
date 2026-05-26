'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { todayISO, formatShortDate } from '@/lib/dateUtils';
import { Music2, Headphones, Plus } from 'lucide-react';

interface SongEntry {
  id: string;
  dateISO: string;
  song: string;
  artist: string;
  addedAt: number;
}

export default function SongsPage() {
  const today = todayISO();
  const [songs, setSongs] = useLocalStorage<SongEntry[]>('fit_songs', []);
  const [songInput, setSongInput] = useState('');
  const [artistInput, setArtistInput] = useState('');

  const todaySong = songs.find(s => s.dateISO === today);
  const sorted = [...songs].sort((a, b) => b.addedAt - a.addedAt);

  const addSong = () => {
    if (!songInput.trim()) return;
    const entry: SongEntry = {
      id: Date.now().toString(),
      dateISO: today,
      song: songInput.trim(),
      artist: artistInput.trim(),
      addedAt: Date.now(),
    };
    setSongs(prev => [entry, ...prev.filter(s => s.dateISO !== today)]);
    setSongInput('');
    setArtistInput('');
  };

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div className="px-4 pt-8 pb-6" style={{ background: 'linear-gradient(180deg, rgba(191,90,242,0.16) 0%, transparent 100%)' }}>
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#BF5AF2]/60 mb-1.5">Daily habit</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#BF5AF2]/15 border border-[#BF5AF2]/35">
              <Headphones size={18} className="text-[#BF5AF2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">Song of the Day</h1>
              <p className="text-[11px] font-mono text-[#BF5AF2]/60 mt-0.5">What's fuelling the grind?</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4 flex flex-col gap-3">

        {/* Today's song showcase */}
        <div
          className="rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(191,90,242,0.13) 0%, rgba(94,92,230,0.09) 100%)',
            border: '1px solid rgba(191,90,242,0.22)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#BF5AF2]/70">
              {todaySong ? "Today's pick" : "No song logged yet"}
            </p>
            <span className="text-[10px] font-mono text-[#44444A]">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {todaySong ? (
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)' }}>
                <Music2 size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F7] text-lg leading-tight">{todaySong.song}</p>
                {todaySong.artist && (
                  <p className="text-sm text-[#6B6B75] font-mono mt-0.5">{todaySong.artist}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#44444A] font-mono">Add today's song below →</p>
          )}
        </div>

        {/* Input */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-3">
            {todaySong ? 'Change today\'s song' : 'Log a song'}
          </p>
          <div className="flex flex-col gap-2">
            <input
              value={songInput}
              onChange={e => setSongInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSong()}
              placeholder="Song title"
              className="h-10 rounded-xl bg-[#0E0E10] border border-[#222225] px-3 text-sm text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#BF5AF2]/50"
            />
            <input
              value={artistInput}
              onChange={e => setArtistInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSong()}
              placeholder="Artist (optional)"
              className="h-10 rounded-xl bg-[#0E0E10] border border-[#222225] px-3 text-sm text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#BF5AF2]/50"
            />
            <button
              onClick={addSong}
              disabled={!songInput.trim()}
              className="h-10 rounded-xl font-semibold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
              style={{
                background: 'linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)',
                boxShadow: songInput.trim() ? '0 2px 18px rgba(191,90,242,0.35)' : undefined,
              }}
            >
              <Plus size={14} /> Save Song
            </button>
          </div>
        </div>

        {/* History */}
        {sorted.length > 0 && (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1D]">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">
                All Songs · {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="divide-y divide-[#1A1A1D]">
              {sorted.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: s.dateISO === today
                        ? 'linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)'
                        : '#1C1C1E',
                    }}
                  >
                    <Music2 size={13} className={s.dateISO === today ? 'text-white' : 'text-[#44444A]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F7] truncate">{s.song}</p>
                    {s.artist && <p className="text-[11px] text-[#6B6B75] font-mono truncate">{s.artist}</p>}
                  </div>
                  <span className="text-[10px] text-[#44444A] font-mono shrink-0">{formatShortDate(s.dateISO)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>
    </div>
  );
}
