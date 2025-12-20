'use client';

import { SafeArea } from '../hooks/minikitMock';
import { ReactNode, useEffect, useState } from 'react';

export function ClientSafeArea({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and before hydration, render children without SafeArea
  if (!isMounted) {
    return <>{children}</>;
  }

  // After hydration, render with SafeArea
  return <SafeArea>{children}</SafeArea>;
}
