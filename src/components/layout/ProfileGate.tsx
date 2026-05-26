'use client';

import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePathname, useRouter } from 'next/navigation';

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { isSetup } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!isSetup && pathname !== '/settings') {
      router.replace('/settings');
    }
  }, [isSetup, pathname, router]);

  return <>{children}</>;
}
