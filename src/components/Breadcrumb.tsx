'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 p-4 bg-white shadow-sm">
      <Link href="/" className="hover:text-blue-600 flex items-center">
        <Home size={16} className="mr-1" />
        Home
      </Link>
      
      {pathname.startsWith('/dashboard') && (
        <>
          <ChevronRight size={16} className="mx-1" />
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
        </>
      )}
    </nav>
  );
} 