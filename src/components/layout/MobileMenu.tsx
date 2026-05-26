'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, X, LayoutDashboard, Utensils, Dumbbell, UtensilsCrossed,
  TrendingUp, Calendar, Music2, Medal, Settings,
} from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => { setMounted(true); }, []);

  const drawer = (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)' }}
      />
      {/* Sheet */}
      <div style={{ position: 'relative', backgroundColor: '#111113', borderRadius: '24px 24px 0 0', borderTop: '1px solid #222225' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={15} color="#0A84FF" />
            <span style={{ color: '#F5F5F7', fontWeight: 700, fontSize: 14 }}>All Pages</span>
          </div>
          <button
            onPointerDown={(e) => { e.stopPropagation(); close(); }}
            style={{ height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#1C1C1E', border: '1px solid #2A2A2F', cursor: 'pointer' }}
          >
            <X size={15} color="#8E8E93" />
          </button>
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 16px 32px' }}>
          {ALL_PAGES.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 0', borderRadius: 16, textDecoration: 'none',
                  backgroundColor: active ? `${color}18` : '#0E0E10',
                  border: `1px solid ${active ? `${color}40` : '#1A1A1D'}`,
                }}
              >
                <div style={{ height: 36, width: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? color : '#8E8E93' }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-8 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 active:bg-[#0A84FF]/20 transition-colors"
      >
        <Zap size={14} className="text-[#0A84FF]" />
        <span className="text-xs font-semibold text-[#0A84FF]">All Pages</span>
      </button>

      {mounted && open && createPortal(drawer, document.body)}
    </>
  );
}
