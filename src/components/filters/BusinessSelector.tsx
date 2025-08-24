'use client';

import { useEffect, useState } from 'react';
import { Business } from '@/lib/queries/business';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BusinessSelectorProps {
  businesses: Business[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export default function BusinessSelector({ businesses, onSelectionChange }: BusinessSelectorProps) {
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Restore from localStorage or default to ALL
  useEffect(() => {
    const key = 'vm:selectedBusinesses';
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as number[];
        setSelectedBusinessIds(parsed);
        onSelectionChange(parsed);
        return;
      } catch {}
    }
    const all = businesses.map(b => b.id);
    setSelectedBusinessIds(all);
    onSelectionChange(all);
  }, [businesses]);

  const handleBusinessToggle = (businessId: number) => {
    const newSelection = selectedBusinessIds.includes(businessId)
      ? selectedBusinessIds.filter(id => id !== businessId)
      : [...selectedBusinessIds, businessId];
    
    setSelectedBusinessIds(newSelection);
    onSelectionChange(newSelection);
    try { localStorage.setItem('vm:selectedBusinesses', JSON.stringify(newSelection)); } catch {}
  };

  const handleSelectAll = () => {
    const all = businesses.map(b => b.id);
    setSelectedBusinessIds(all);
    onSelectionChange(all);
    try { localStorage.setItem('vm:selectedBusinesses', JSON.stringify(all)); } catch {}
  };

  const handleDeselectAll = () => {
    setSelectedBusinessIds([]);
    onSelectionChange([]);
    try { localStorage.setItem('vm:selectedBusinesses', JSON.stringify([])); } catch {}
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <span>Select Businesses ({selectedBusinessIds.length} selected)</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-2 bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between px-2 pb-2">
            <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:underline">Select all</button>
            <button onClick={handleDeselectAll} className="text-xs text-blue-600 hover:underline">Deselect all</button>
          </div>
          {businesses.map((business) => (
            <label
              key={business.id}
              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBusinessIds.includes(business.id)}
                onChange={() => handleBusinessToggle(business.id)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{business.business_name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
} 