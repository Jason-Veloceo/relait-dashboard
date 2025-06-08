'use client';

import { useState, useEffect } from 'react';

interface DatabaseSelectorProps {
  onDatabaseChange: (database: 'UAT' | 'PROD') => void;
}

export default function DatabaseSelector({ onDatabaseChange }: DatabaseSelectorProps) {
  const [selectedDb, setSelectedDb] = useState<'UAT' | 'PROD'>('UAT');

  // Fetch current database on mount
  useEffect(() => {
    const fetchCurrentDb = async () => {
      try {
        const response = await fetch('/api/current-database');
        const data = await response.json();
        if (data.success) {
          setSelectedDb(data.database);
        }
      } catch (error) {
        console.error('Error fetching current database:', error);
      }
    };

    fetchCurrentDb();
  }, []);

  const handleDatabaseChange = async (database: 'UAT' | 'PROD') => {
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

      setSelectedDb(database);
      onDatabaseChange(database);
    } catch (error) {
      console.error('Error switching database:', error);
      alert('Failed to switch database. Please try again.');
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
      <span className="text-sm font-medium text-gray-700">Database:</span>
      <div className="flex rounded-md shadow-sm">
        <button
          onClick={() => handleDatabaseChange('UAT')}
          className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
            selectedDb === 'UAT'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          UAT
        </button>
        <button
          onClick={() => handleDatabaseChange('PROD')}
          className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
            selectedDb === 'PROD'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          PROD
        </button>
      </div>
    </div>
  );
} 