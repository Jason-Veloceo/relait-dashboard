'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ValuableMomentsDashboard from '@/components/ValuableMomentsDashboard';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/lib/contexts/SimpleAuthContext';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Double-check authentication on page load
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ClientLayout>
      <main className="min-h-screen" style={{ backgroundColor: '#F7F5FF' }}>
        <ValuableMomentsDashboard />
      </main>
    </ClientLayout>
  );
} 