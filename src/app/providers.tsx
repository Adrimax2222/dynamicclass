
"use client";

import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </FirebaseClientProvider>
  );
}
