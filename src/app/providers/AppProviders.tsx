import React from 'react';

import { LanguageProvider } from './LanguageProvider';
import { NetworkProvider } from './NetworkProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <NetworkProvider>{children}</NetworkProvider>
    </LanguageProvider>
  );
}

