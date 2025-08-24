'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Business } from '@/lib/queries/business';
import { ValuableMomentMetrics } from '@/lib/queries/valuable-moments';
import DateRangeSelector from './filters/DateRangeSelector';
import BusinessSelector from './filters/BusinessSelector';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ValuableMomentsChart from './ValuableMomentsChart';

type SortField = 'businessName' | 'emailsSent' | 'questionsAnswered' | 'socialPosts' | 'contentAdded';
type SortDirection = 'asc' | 'desc';

export default function ValuableMomentsDashboard() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState<ValuableMomentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgVM, setAvgVM] = useState<number>(0);
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('businessName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses');
        const data = await response.json();
        if (data.success) {
          setBusinesses(data.data);
        } else {
          setError(data.error || 'Failed to fetch businesses');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch metrics when filters change
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const businessParam = selectedBusinessIds.length > 0 
          ? `businessIds=${selectedBusinessIds.join(',')}`
          : '';
        const response = await fetch(`/api/valuable-moments?days=${selectedDays}${businessParam ? `&${businessParam}` : ''}`);
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
          if (data.totals) setAvgVM(data.totals.avgVMPerCompany);
        } else {
          setError(data.error || 'Failed to fetch metrics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedDays, selectedBusinessIds]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const sortedMetrics = [...metrics].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'businessName') {
      return a.businessName.localeCompare(b.businessName) * direction;
    }
    return ((a[sortField] as number) - (b[sortField] as number)) * direction;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Relait Platform Valuable Moments</h1>
      
      {/* Filters */}
      <div className="mb-8 space-y-4 bg-white p-4 rounded-lg shadow">
        <DateRangeSelector onRangeChange={setSelectedDays} />
        <BusinessSelector 
          businesses={businesses} 
          onSelectionChange={setSelectedBusinessIds} 
        />
      </div>

      {/* KPI */}
      {!loading && !error && (
        <div className="mb-4">
          <div className="inline-block bg-white rounded-md shadow px-4 py-3">
            <div className="text-xs text-gray-500">Avg valuable moments / company</div>
            <div className="text-xl font-semibold">{avgVM.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <ValuableMomentsChart 
        days={selectedDays}
        selectedBusinessIds={selectedBusinessIds}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('businessName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Business Name</span>
                    {getSortIcon('businessName')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total VM
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('emailsSent')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Emails Sent</span>
                    {getSortIcon('emailsSent')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('questionsAnswered')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Questions Answered</span>
                    {getSortIcon('questionsAnswered')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('socialPosts')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Social Posts</span>
                    {getSortIcon('socialPosts')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('contentAdded')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Content Added</span>
                    {getSortIcon('contentAdded')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMetrics.map((metric) => (
                <tr 
                  key={metric.businessId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/dashboard/${metric.businessId}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {metric.businessName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{metric.emailsSent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{metric.questionsAnswered}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{metric.socialPosts}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{metric.contentAdded}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{metric.totalVM}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 