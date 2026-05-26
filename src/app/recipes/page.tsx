'use client';

import { useState, useMemo } from 'react';
import { RECIPES } from '@/lib/recipes';
import { useDailyLog } from '@/hooks/useDailyLog';
import type { Recipe } from '@/types';
import { Search, Check, ExternalLink } from 'lucide-react';

const CATEGORY_META: { id: Recipe['category'] | 'all'; label: string; emoji: string }[] = [
  { id: 'all',        label: 'All',        emoji: '🍽️' },
  { id: 'chicken',    label: 'Chicken',    emoji: '🍗' },
  { id: 'fish',       label: 'Fish',       emoji: '🐟' },
  { id: 'meat',       label: 'Meat',       emoji: '🥩' },
  { id: 'vegetarian', label: 'Veggie',     emoji: '🥬' },
  { id: 'vegan',      label: 'Vegan',      emoji: '🌱' },
  { id: 'dessert',    label: 'Dessert',    emoji: '🍰' },
  { id: 'airfryer',   label: 'Air Fryer',  emoji: '🍳' },
];

export default function RecipesPage() {
  const { addFoodEntry } = useDailyLog();
  const [category, setCategory] = useState<Recipe['category'] | 'all'>('all');
  const [highProtein, setHighProtein] = useState(false);
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      if (category !== 'all' && r.category !== category) return false;
      if (highProtein && r.proteinG < 35) return false;
      if (search.trim() && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, highProtein, search]);

  const handleAdd = (recipe: Recipe) => {
    addFoodEntry({
      id: `recipe-${recipe.id}-${Date.now()}`,
      timestamp: Date.now(),
      rawInput: recipe.name,
      description: recipe.name,
      macros: {
        calories: recipe.calories,
        proteinG: recipe.proteinG,
        carbsG: recipe.carbsG,
        fatG: recipe.fatG,
      },
      estimatedBy: 'manual',
    });
    setAdded(prev => new Set([...prev, recipe.id]));
    setTimeout(() => {
      setAdded(prev => {
        const next = new Set(prev);
        next.delete(recipe.id);
        return next;
      });
    }, 2000);
  };

  const MACRO_COLORS = { kcal: '#FF9F0A', P: '#30D158', C: '#0A84FF', F: '#FF453A' };

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div
        className="px-4 pt-8 pb-5"
        style={{ background: 'linear-gradient(180deg, rgba(48,209,88,0.12) 0%, transparent 100%)' }}
      >
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase mb-1.5 text-[#30D158]/60">MyProtein recipes</p>
          <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight">Food Ideas</h1>
          <p className="text-[11px] font-mono mt-0.5 text-[#30D158]/60">{RECIPES.length} recipes · tap to add to today&apos;s log</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto lg:max-w-none px-4 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#44444A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#111113] border border-[#222225] text-sm text-[#F5F5F7] placeholder:text-[#44444A] focus:outline-none focus:border-[#30D158]/50"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_META.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-all shrink-0"
              style={category === cat.id
                ? { backgroundColor: 'rgba(48,209,88,0.15)', borderColor: 'rgba(48,209,88,0.4)', color: '#30D158' }
                : { borderColor: '#222225', color: '#44444A', backgroundColor: '#111113' }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* High protein toggle */}
        <button
          onClick={() => setHighProtein(!highProtein)}
          className="self-start flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
          style={highProtein
            ? { backgroundColor: 'rgba(94,92,230,0.15)', borderColor: 'rgba(94,92,230,0.4)', color: '#5E5CE6' }
            : { borderColor: '#222225', color: '#44444A', backgroundColor: '#111113' }}
        >
          💪 High Protein ≥35g
        </button>

        {/* Count */}
        <p className="text-[10px] font-mono text-[#44444A]">{filtered.length} recipes</p>

        {/* Recipe grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(recipe => {
            const isAdded = added.has(recipe.id);
            const catMeta = CATEGORY_META.find(c => c.id === recipe.category);
            return (
              <div
                key={recipe.id}
                className="rounded-2xl bg-[#111113] border border-[#222225] p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{catMeta?.emoji}</span>
                      <span className="text-[9px] font-mono text-[#44444A] uppercase tracking-wider">{recipe.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#F5F5F7] leading-snug">{recipe.name}</p>
                  </div>
                </div>

                {/* Macro pills */}
                <div className="flex gap-2">
                  {[
                    { label: 'kcal', value: recipe.calories, color: MACRO_COLORS.kcal },
                    { label: 'P', value: `${recipe.proteinG}g`, color: MACRO_COLORS.P },
                    { label: 'C', value: `${recipe.carbsG}g`, color: MACRO_COLORS.C },
                    { label: 'F', value: `${recipe.fatG}g`, color: MACRO_COLORS.F },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center px-2.5 py-1.5 rounded-lg flex-1"
                      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20` }}
                    >
                      <span className="font-mono text-xs font-semibold" style={{ color }}>{value}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: `${color}80` }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAdd(recipe)}
                    className="flex-1 h-9 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={isAdded
                      ? { backgroundColor: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)', color: '#30D158' }
                      : { background: 'linear-gradient(135deg, rgba(48,209,88,0.2) 0%, rgba(10,132,255,0.2) 100%)', border: '1px solid rgba(48,209,88,0.2)', color: '#F5F5F7' }}
                  >
                    {isAdded ? <><Check size={13} /> Added</> : '+ Add to log'}
                  </button>
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ backgroundColor: '#1C1C1E', border: '1px solid #2A2A2F', color: '#44444A' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#44444A')}
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#222225] p-8 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-semibold text-[#44444A]">No recipes found</p>
            <p className="text-[11px] text-[#2A2A2F] font-mono">Try a different filter or search term</p>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
