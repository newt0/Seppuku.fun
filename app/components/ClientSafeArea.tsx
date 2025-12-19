'use client';

import { SafeArea } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';

export function ClientSafeArea({ children }: { children: ReactNode }) {
  return <SafeArea>{children}</SafeArea>;
}
