'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, TrendingUp, Calendar, Dumbbell, Music2, Zap, UtensilsCrossed, Medal, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/food',      label: 'Food',       icon: Utensils },
  { href: '/gym',       label: 'Gym',        icon: Dumbbell },
  { href: '/recipes',   label: 'Recipes',    icon: UtensilsCrossed },
  { href: '/progress',  label: 'Progress',   icon: TrendingUp },
  { href: '/plan',      label: 'Plan',       icon: Calendar },
  { href: '/songs',     label: 'Songs',      icon: Music2 },
  { href: '/badges',    label: 'Badges',     icon: Medal },
  { href: '/settings',  label: 'Settings',   icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r border-[#1A1A1D] bg-[#080808] px-4 py-6 fixed left-0 top-0 bottom-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A84FF]/12 border border-[#0A84FF]/30 group-hover:bg-[#0A84FF]/20 transition-colors">
          <Zap size={16} className="text-[#0A84FF]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#F5F5F5]">Abs by Aug</p>
          <p className="text-[10px] text-[#525252]">Challenge Mode</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-[#0A84FF]/12 text-[#0A84FF] border border-[#0A84FF]/20'
                  : 'text-[#525252] hover:text-[#A3A3A3] hover:bg-[#111113]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
