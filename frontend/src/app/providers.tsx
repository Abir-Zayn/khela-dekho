'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { queryClient } from './configs/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure the client is instantiated once per session (preventing state loss on reload or hydration mismatches)
  const [client] = useState(() => queryClient);

  return (
    <ClerkProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}


