'use client';

import { ReactNode } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import DatabaseSelector from '@/components/DatabaseSelector';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <h1 className="text-xl font-semibold">Relait Dashboard</h1>
          <DatabaseSelector 
            onDatabaseChange={async (database) => {
              try {
                const response = await fetch('/api/switch-database', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ database }),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to switch database');
                }
                
                // Reload the page to refresh data
                window.location.reload();
              } catch (error) {
                console.error('Error switching database:', error);
                alert('Failed to switch database. Please try again.');
              }
            }}
          />
        </div>
        <Breadcrumb />
        <main className="p-4">
          {children}
        </main>
      </div>
    </>
  );
} 