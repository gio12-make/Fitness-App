'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, X, LayoutDashboard, Utensils, Dumbbell, UtensilsCrossed,
  TrendingUp, Calendar, Music2, Medal, Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

const ALL_PAGES = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, color: '#0A84FF' },
  { href: '/food',      label: 'Food',        icon: Utensils,        color: '#FF9F0A' },
  { href: '/gym',       label: 'Gym',         icon: Dumbbell,        color: '#0A84FF' },
  { href: '/recipes',   label: 'Recipes',     icon: UtensilsCrossed, color: '#30D158' },
  { href: '/progress',  label: 'Progress',    icon: TrendingUp,      color: '#BF5AF2' },
  { href: '/plan',      label: 'Plan',        icon: Calendar,        color: '#0A84FF' },
  { href: '/songs',     label: 'Songs',       icon: Music2,          color: '#FF453A' },
  { href: '/badges',    label: 'Badges',      icon: Medal,           color: '#FFD60A' },
  { href: '/settings',  label: 'Settings',    icon: Settings,        color: '#8E8E93' },
];

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <>
      {/* Top bar trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 active:bg-[#0A84FF]/20 transition-colors"
      >
        <Zap size={14} className="text-[#0A84FF]" />
        <span className="text-xs font-semibold text-[#0A84FF]">All Pages</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-[#111113] border-t border-[#222225]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-[#0A84FF]" />
                <p className="text-sm font-bold text-[#F5F5F7]">All Pages</p>
              </div>
              <button
                onPointerDown={(e) => { e.stopPropagation(); close(); }}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#1C1C1E] border border-[#2A2A2F]"
              >
                <X size={15} className="text-[#8E8E93]" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              {ALL_PAGES.map(({ href, label, icon: Icon, color }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-95"
                    style={active
                      ? { backgroundColor: `${color}15`, borderColor: `${color}35` }
                      : { backgroundColor: '#0E0E10', borderColor: '#1A1A1D' }}
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                    >
                      <Icon size={17} style={{ color }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: active ? color : '#8E8E93' }}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
