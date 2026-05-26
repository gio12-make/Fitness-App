'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, TrendingUp, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/food',      label: 'Food',     icon: Utensils },
  { href: '/gym',       label: 'Gym',      icon: Dumbbell },
  { href: '/recipes',   label: 'Recipes',  icon: UtensilsCrossed },
  { href: '/progress',  label: 'Progress', icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#1A1A1D] bg-[#080808]/95 backdrop-blur-md lg:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                active ? 'text-[#0A84FF]' : 'text-[#525252] hover:text-[#A3A3A3]'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
