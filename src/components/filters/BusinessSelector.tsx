'use client';

import { useState } from 'react';
import { Business } from '@/lib/queries/business';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BusinessSelectorProps {
  businesses: Business[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export default function BusinessSelector({ businesses, onSelectionChange }: BusinessSelectorProps) {
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBusinessToggle = (businessId: number) => {
    const newSelection = selectedBusinessIds.includes(businessId)
      ? selectedBusinessIds.filter(id => id !== businessId)
      : [...selectedBusinessIds, businessId];
    
    setSelectedBusinessIds(newSelection);
    onSelectionChange(newSelection);
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