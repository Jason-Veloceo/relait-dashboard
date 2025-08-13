'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessDetails from '@/components/BusinessDetails';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/lib/contexts/SimpleAuthContext';

export default function BusinessPage({ params }: { params: { businessId: string } }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Double-check authentication on page load
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Don't render business page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ClientLayout>
      <main>
        <BusinessDetails businessId={parseInt(params.businessId)} />
      </main>
    </ClientLayout>
  );
} 