'use client';

import { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

interface DailyMoments {
  date: string;
  total_moments: number;
  cumulative_total: number;
}

interface ValuableMomentsChartProps {
  days: number;
  selectedBusinessIds: number[];
}

export default function ValuableMomentsChart({ days, selectedBusinessIds }: ValuableMomentsChartProps) {
  const [data, setData] = useState<DailyMoments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const businessParam = selectedBusinessIds.length > 0 
          ? `&businessIds=${selectedBusinessIds.join(',')}`
          : '';
        const response = await fetch(`/api/valuable-moments/daily?days=${days}${businessParam}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch chart data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days, selectedBusinessIds]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
        No data available for the selected time period
      </div>
    );
  }

  const barData = data.map(d => ({
    date: d.date,
    moments: d.total_moments
  }));
  // Compute 7-day moving average for primary axis
  const totals = data.map(d => d.total_moments);
  const ma7: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < totals.length; i++) {
    sum += totals[i];
    if (i >= 7) sum -= totals[i - 7];
    ma7.push(i >= 6 ? sum / 7 : null);
  }
  const lineData = [{ id: '7-day MA', data: data.map((d, i) => ({ x: d.date, y: ma7[i] })) }];

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Valuable Moments</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Valuable Moments</div>
          <div className="text-2xl font-bold text-blue-600">
            {data[data.length - 1]?.cumulative_total || 0}
          </div>
        </div>
      </div>
      <div className="h-[400px] relative">
        <ResponsiveBar
          data={barData}
          keys={['moments']}
          indexBy="date"
          margin={{ top: 50, right: 120, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={['#22c55e']}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Date',
            legendPosition: 'middle',
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Daily Moments',
            legendPosition: 'middle',
            legendOffset: -40
          }}
          enableLabel={true}
          labelSkipWidth={12}
          labelSkipHeight={12}
        />
        {data.length >= 7 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 50, right: 120, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              curve="monotoneX"
              enablePoints={true}
              pointSize={6}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor="#2563eb"
              enableGridX={false}
              enableGridY={false}
              colors={['#2563eb']}
              lineWidth={3}
              axisTop={null}
              axisRight={null}
              axisBottom={null}
              axisLeft={null}
              isInteractive={true}
              useMesh={true}
              legends={[]}
            />
          </div>
        )}
      </div>
    </div>
  );
} 