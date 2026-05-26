'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePathname, useRouter } from 'next/navigation';

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { isSetup } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
    if (!isSetup && pathname !== '/settings') {
      router.replace('/settings');
    }
  }, [isSetup, pathname, router]);

  // Don't flash content before check
  if (!checked) return null;

  return <>{children}</>;
}
