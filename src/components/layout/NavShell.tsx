'use client';

import { usePathname } from 'next/navigation';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { MobileMenuButton } from './MobileMenu';

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== '/';

  return (
    <>
      {showNav && <SideNav />}

      {/* Mobile top bar — hidden on desktop */}
      {showNav && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-4 bg-[#080808]/90 backdrop-blur-md border-b border-[#111113]">
          <span className="text-sm font-bold text-[#F5F5F7]">Abs by Aug</span>
          <MobileMenuButton />
        </div>
      )}

      <main className={showNav ? 'lg:pl-56 min-h-screen pb-20 lg:pb-8 pt-12 lg:pt-0' : ''}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  );
}
