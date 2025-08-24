'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatabaseSelector from '@/components/DatabaseSelector';
import { useAuth } from '@/lib/contexts/SimpleAuthContext';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <h1 className="text-xl font-semibold cursor-pointer" onClick={() => router.push('/dashboard')}>
            Relait Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <DatabaseSelector 
              onDatabaseChange={() => {
                // DatabaseSelector handles the POST; simply reload to refresh data
                window.location.reload();
              }}
            />
            
            {/* User Menu */}
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <main className="p-4">
          {children}
        </main>
      </div>
    </>
  );
} 