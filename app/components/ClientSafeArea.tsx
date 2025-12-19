'use client';

import { SafeArea } from '@coinbase/onchainkit/minikit';
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
