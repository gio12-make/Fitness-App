'use client';

import { usePathname } from 'next/navigation';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== '/';

  return (
    <>
      {showNav && <SideNav />}
      <main className={showNav ? 'lg:pl-56 min-h-screen pb-20 lg:pb-8' : ''}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  );
}
