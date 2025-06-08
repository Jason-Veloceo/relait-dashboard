'use client';

import { ReactNode } from 'react';
import { AuthProvider } from "@/lib/contexts/SimpleAuthContext";
import ClientLayout from "@/components/ClientLayout";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </AuthProvider>
  );
} 