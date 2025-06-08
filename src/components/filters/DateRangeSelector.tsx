'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays, subDays } from 'date-fns';

interface DateRangeSelectorProps {
  onRangeChange: (days: number) => void;
  initialDays?: number;
}

const RANGE_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function DateRangeSelector({ onRangeChange, initialDays = 30 }: DateRangeSelectorProps) {
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Initialize dates when component mounts or initialDays changes
  useEffect(() => {
    const end = new Date();
    const start = subDays(end, initialDays);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, [initialDays]);

  const handleRangeChange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setIsCustomRange(false);
    setSelectedDays(days);
    onRangeChange(days);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = differenceInDays(end, start);
      if (days >= 0) {
        setIsCustomRange(true);
        onRangeChange(days);
        setSelectedDays(days);
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Time Range:</span>
        <div className="flex rounded-md shadow-sm">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.days}
              onClick={() => handleRangeChange(option.days)}
              className={`px-4 py-2 text-sm font-medium ${
                selectedDays === option.days && !isCustomRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                option.days === RANGE_OPTIONS[0].days
                  ? 'rounded-l-md'
                  : option.days === RANGE_OPTIONS[RANGE_OPTIONS.length - 1].days
                  ? 'rounded-r-md'
                  : ''
              } border border-gray-300`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleCustomDateChange();
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleCustomDateChange();
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
} 