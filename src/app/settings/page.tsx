'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile, buildProfile, calcProfileTargets } from '@/hooks/useProfile';
import { User, Flame, Dumbbell, Footprints } from 'lucide-react';

export default function SettingsPage() {
  const { profile, setProfile } = useProfile();
  const router = useRouter();
  const isFirstSetup = !profile;

  const [name, setName]         = useState(profile?.name ?? '');
  const [sex, setSex]           = useState<'male' | 'female'>(profile?.sex ?? 'male');
  const [age, setAge]           = useState(profile?.ageYears?.toString() ?? '');
  const [weight, setWeight]     = useState(profile?.weightKg?.toString() ?? '');
  const [height, setHeight]     = useState(profile?.heightCm?.toString() ?? '');
  const [saved, setSaved]       = useState(false);

  const preview = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a || w < 30 || h < 100 || a < 10) return null;
    const draft = buildProfile(name || 'You', sex, a, w, h);
    const targets = calcProfileTargets(draft);
    return { draft, targets };
  }, [name, sex, age, weight, height]);

  const canSave = !!preview && name.trim().length > 0;

  const handleSave = () => {
    if (!preview) return;
    const p = buildProfile(name.trim(), sex, parseInt(age), parseFloat(weight), parseFloat(height));
    // Preserve start weight + date if updating (not first setup)
    if (profile) {
      p.startWeight = profile.startWeight;
      p.startDate   = profile.startDate;
    }
    setProfile(p);
    // Clear cached weekly plan so it regenerates with new targets
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekKey = `fit_weekly_plan_${monday.toISOString().split('T')[0]}`;
    localStorage.removeItem(weekKey);
    setSaved(true);
    // After first-time setup, go straight to dashboard
    if (isFirstSetup) {
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } else {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      <div
        className="px-4 pt-8 pb-6"
        style={{ background: 'linear-gradient(180deg, rgba(10,132,255,0.12) 0%, transparent 100%)' }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center">
              <User size={18} className="text-[#0A84FF]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F7] tracking-tight leading-none">
                {isFirstSetup ? 'Set up your profile' : 'Profile & Settings'}
              </h1>
              <p className="text-[11px] font-mono mt-0.5 text-[#0A84FF]/60">
                {isFirstSetup ? 'Personalise your targets' : 'Update your details anytime'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 flex flex-col gap-4">

        {/* Form */}
        <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5 flex flex-col gap-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A]">Your Details</p>

          {/* Name */}
          <div>
            <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 w-full rounded-xl bg-[#0E0E10] border border-[#222225] px-4 text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#0A84FF]/50"
            />
          </div>

          {/* Sex */}
          <div>
            <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">Sex</p>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold border transition-all capitalize"
                  style={sex === s
                    ? { backgroundColor: 'rgba(10,132,255,0.15)', borderColor: 'rgba(10,132,255,0.4)', color: '#0A84FF' }
                    : { borderColor: '#222225', color: '#44444A', backgroundColor: '#0E0E10' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Age + Weight + Height */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Age (yrs)', val: age, set: setAge, placeholder: '22' },
              { label: 'Weight (kg)', val: weight, set: setWeight, placeholder: '80' },
              { label: 'Height (cm)', val: height, set: setHeight, placeholder: '177' },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <p className="text-[9px] font-semibold text-[#44444A] uppercase tracking-wider mb-1.5">{label}</p>
                <input
                  type="number"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="h-11 w-full rounded-xl bg-[#0E0E10] border border-[#222225] text-center font-mono text-sm text-[#F5F5F7] placeholder:text-[#333338] focus:outline-none focus:border-[#0A84FF]/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        {preview ? (
          <div className="rounded-2xl bg-[#111113] border border-[#222225] p-5">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-4">Your Personalised Targets</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Flame, label: 'Training day', value: `${preview.targets.calorieTrainingDay.toLocaleString()} kcal`, color: '#FF9F0A' },
                { icon: Flame, label: 'Rest day', value: `${preview.targets.calorieRestDay.toLocaleString()} kcal`, color: '#FF9F0A' },
                { icon: Dumbbell, label: 'Daily protein', value: `${preview.targets.proteinTargetG}g`, color: '#30D158' },
                { icon: Footprints, label: 'Steps target', value: '10,000', color: '#BF5AF2' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-[#0E0E10] border border-[#1A1A1D] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={10} style={{ color }} />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#44444A]">{label}</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-[#F5F5F7]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1A1A1D]">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#44444A] mb-2">Goal weight for abs by Aug 1</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold text-[#0A84FF]">{preview.draft.goalWeightKg}</span>
                <span className="text-sm text-[#6B6B75]">kg</span>
                <span className="text-xs text-[#44444A] font-mono ml-2">
                  ({preview.draft.weightKg > preview.draft.goalWeightKg
                    ? `lose ${(preview.draft.weightKg - preview.draft.goalWeightKg).toFixed(1)}kg`
                    : `already there!`})
                </span>
              </div>
              <p className="text-[10px] text-[#44444A] font-mono mt-1">
                Based on estimated {preview.targets.estimatedBF}% body fat → target ~{sex === 'male' ? '12' : '20'}% for visible abs
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#222225] p-6 text-center">
            <p className="text-xs text-[#44444A]">Fill in your details above to see your targets</p>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full h-[52px] rounded-2xl font-semibold text-sm transition-all"
          style={canSave
            ? { background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)', boxShadow: '0 4px 22px rgba(10,132,255,0.28)', color: 'white' }
            : { backgroundColor: '#1C1C1E', color: '#44444A', border: '1px solid #222225' }}
        >
          {saved ? '✓ Saved!' : isFirstSetup ? 'Start tracking' : 'Save changes'}
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}
