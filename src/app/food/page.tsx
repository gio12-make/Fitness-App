'use client';

import { useState, useRef } from 'react';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { estimateFood } from '@/lib/estimator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { Trash2, Pencil, Plus, Cpu, User } from 'lucide-react';
import { formatTime } from '@/lib/dateUtils';
import { clsx } from 'clsx';
import type { FoodEntry, Macros } from '@/types';

function MacroChip({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-stat text-base font-semibold" style={{ color }}>{Math.round(value)}</span>
      <span className="text-[10px] text-[#525252]">{unit}</span>
      <span className="text-[9px] text-[#3A3A3A] uppercase tracking-wide">{label}</span>
    </div>
  );
}

function EntryItem({
  entry,
  onDelete,
  onEdit,
}: {
  entry: FoodEntry;
  onDelete: () => void;
  onEdit: (entry: FoodEntry) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1A1A1A] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-medium text-[#F5F5F5] truncate">{entry.description}</p>
          {entry.estimatedBy === 'usda' && (
            <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-[#22C55E] bg-[#22C55E]/10 px-1 py-0.5 rounded">
              <Cpu size={8} /> USDA
            </span>
          )}
          {entry.estimatedBy === 'api' && (
            <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-[#00D4FF] bg-[#00D4FF]/10 px-1 py-0.5 rounded">
              <Cpu size={8} /> web
            </span>
          )}
          {entry.estimatedBy === 'estimated' && (
            <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-[#F59E0B] bg-[#F59E0B]/10 px-1 py-0.5 rounded">
              ⚠ estimate
            </span>
          )}
          {entry.estimatedBy === 'manual' && (
            <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-[#F59E0B] bg-[#F59E0B]/10 px-1 py-0.5 rounded">
              <User size={8} /> edited
            </span>
          )}
        </div>
        <div className="flex gap-3 text-xs text-[#A3A3A3]">
          <span className="font-stat font-semibold text-[#F5F5F5]">{entry.macros.calories} kcal</span>
          <span>{entry.macros.proteinG}g P</span>
          <span>{entry.macros.carbsG}g C</span>
          <span>{entry.macros.fatG}g F</span>
          <span className="ml-auto text-[#525252]">{formatTime(entry.timestamp)}</span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg text-[#525252] hover:text-[#A3A3A3] hover:bg-[#1A1A1A] transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#525252] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function FoodPage() {
  const { log, totalMacros, addFoodEntry, deleteFoodEntry, updateFoodEntry } = useDailyLog();
  const { todayPlan } = useWeeklyPlan();

  const calTarget = todayPlan?.calorieTarget ?? 2200;
  const proteinTarget = 160;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);
  const [editMacros, setEditMacros] = useState<Macros>({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const [editDesc, setEditDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await estimateFood(input);
      const entry: FoodEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        rawInput: input,
        description: result.description,
        macros: result.macros,
        estimatedBy: result.estimatedBy,
      };
      addFoodEntry(entry);
      setInput('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (entry: FoodEntry) => {
    setEditEntry(entry);
    setEditMacros(entry.macros);
    setEditDesc(entry.description);
  };

  const saveEdit = () => {
    if (!editEntry) return;
    updateFoodEntry(editEntry.id, editMacros, editDesc);
    setEditEntry(null);
  };

  const macros = [
    { label: 'Calories', value: totalMacros.calories, target: calTarget, unit: 'kcal', color: '#00D4FF' },
    { label: 'Protein', value: totalMacros.proteinG, target: proteinTarget, unit: 'g', color: '#22C55E' },
    { label: 'Carbs', value: totalMacros.carbsG, target: calTarget * 0.4 / 4, unit: 'g', color: '#F59E0B' },
    { label: 'Fat', value: totalMacros.fatG, target: calTarget * 0.3 / 9, unit: 'g', color: '#A855F7' },
  ];

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#F5F5F5]">Food</h1>
        <p className="text-sm text-[#525252] mt-0.5">Log what you eat in plain English</p>
      </div>

      {/* Macro summary */}
      <Card className="mb-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {macros.map((m) => (
            <MacroChip key={m.label} label={m.label} value={m.value} unit={m.unit} color={m.color} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {macros.map((m) => (
            <ProgressBar key={m.label} value={m.value} max={m.target} color={m.color} />
          ))}
        </div>
      </Card>

      {/* Input */}
      <Card className="mb-4">
        <p className="text-xs text-[#525252] mb-2">What did you eat?</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleAdd()}
            placeholder='e.g. "3 eggs, 2 slices toast, avocado"'
            className="flex-1 h-12 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#525252] focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 transition-colors"
          />
          <Button onClick={handleAdd} disabled={loading || !input.trim()} className="shrink-0 h-12 w-12 p-0">
            {loading ? <Spinner size={16} /> : <Plus size={18} />}
          </Button>
        </div>
        <p className="text-[10px] text-[#3A3A3A] mt-2">
          Macros are estimated automatically. Tap ✏️ to edit any entry.
        </p>
      </Card>

      {/* Entry list */}
      {log.foodEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#525252] text-sm">No food logged yet today.</p>
          <p className="text-[#3A3A3A] text-xs mt-1">Start typing above to log your first meal.</p>
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#525252] uppercase tracking-wider">Today's Log</p>
            <span className="text-xs text-[#525252]">{log.foodEntries.length} entries</span>
          </div>
          {[...log.foodEntries].reverse().map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              onDelete={() => deleteFoodEntry(entry.id)}
              onEdit={openEdit}
            />
          ))}
        </Card>
      )}

      {/* Edit modal */}
      <Modal open={editEntry !== null} onClose={() => setEditEntry(null)} title="Edit Entry">
        <div className="flex flex-col gap-3">
          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Calories', field: 'calories' as const },
              { label: 'Protein (g)', field: 'proteinG' as const },
              { label: 'Carbs (g)', field: 'carbsG' as const },
              { label: 'Fat (g)', field: 'fatG' as const },
            ].map(({ label, field }) => (
              <Input
                key={field}
                label={label}
                type="number"
                value={editMacros[field]}
                onChange={(e) => setEditMacros((prev) => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
              />
            ))}
          </div>
          <Button onClick={saveEdit} className="w-full mt-1">Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
