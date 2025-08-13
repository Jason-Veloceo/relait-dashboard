'use client';

import { useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { format, subDays } from 'date-fns';
import { ValuableMomentMetrics } from '@/lib/queries/valuable-moments';
import DateRangeSelector from './filters/DateRangeSelector';

interface DetailRecord {
  date: string;
  content: string;
  type?: string;
}

interface BusinessDetailsProps {
  businessId: number;
}

export default function BusinessDetails({ businessId }: BusinessDetailsProps) {
  const [metrics, setMetrics] = useState<ValuableMomentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [detailData, setDetailData] = useState<{
    emails: DetailRecord[];
    questions: DetailRecord[];
    socialPosts: DetailRecord[];
    content: DetailRecord[];
  }>({
    emails: [],
    questions: [],
    socialPosts: [],
    content: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main metrics
        const response = await fetch(`/api/valuable-moments?days=${selectedDays}&businessIds=${businessId}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch metrics');
        }
        
        if (data.data.length > 0) {
          setMetrics(data.data[0]);
          
          // Fetch detailed data for each category
          const [emailsRes, questionsRes, socialRes, contentRes] = await Promise.all([
            fetch(`/api/valuable-moments/details?businessId=${businessId}&days=${selectedDays}&type=emails`),
            fetch(`/api/valuable-moments/details?businessId=${businessId}&days=${selectedDays}&type=questions`),
            fetch(`/api/valuable-moments/details?businessId=${businessId}&days=${selectedDays}&type=social`),
            fetch(`/api/valuable-moments/details?businessId=${businessId}&days=${selectedDays}&type=content`)
          ]);

          const [emailsData, questionsData, socialData, contentData] = await Promise.all([
            emailsRes.json(),
            questionsRes.json(),
            socialRes.json(),
            contentRes.json()
          ]);

          setDetailData({
            emails: emailsData.success ? emailsData.data : [],
            questions: questionsData.success ? questionsData.data : [],
            socialPosts: socialData.success ? socialData.data : [],
            content: contentData.success ? contentData.data : []
          });
        } else {
          setError(`Business with ID ${businessId} not found. Please check the business ID or return to the main dashboard.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [businessId, selectedDays]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  const pieData = [
    { id: 'Emails Sent', value: metrics.emailsSent },
    { id: 'Questions Answered', value: metrics.questionsAnswered },
    { id: 'Social Posts', value: metrics.socialPosts },
    { id: 'Content Added', value: metrics.contentAdded },
  ];

  const DetailTable = ({ title, data }: { title: string; data: DetailRecord[] }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="overflow-y-auto max-h-[300px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">Date</th>
              {title === 'Content Added' && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">Type</th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                {title === 'Emails Sent' ? 'Email' :
                 title === 'Questions Answered' ? 'Question' :
                 title === 'Social Posts' ? 'Social Post Title' : 'Content Title'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-xs text-gray-500">{record.date}</td>
                {title === 'Content Added' && (
                  <td className="px-4 py-2 text-xs text-gray-500">{record.type}</td>
                )}
                <td className="px-4 py-2 text-xs text-gray-900">{record.content}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={title === 'Content Added' ? 3 : 2} className="px-4 py-2 text-xs text-gray-500 text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{metrics.businessName}</h1>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <DateRangeSelector onRangeChange={setSelectedDays} initialDays={selectedDays} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Summary Cards */}
        <div className="rounded-lg shadow grid grid-cols-2 gap-4 p-4 bg-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics.emailsSent}</div>
            <div className="text-sm text-gray-600">Emails Sent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.questionsAnswered}</div>
            <div className="text-sm text-gray-600">Questions Answered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics.socialPosts}</div>
            <div className="text-sm text-gray-600">Social Posts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{metrics.contentAdded}</div>
            <div className="text-sm text-gray-600">Content Added</div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-lg shadow p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Activity Distribution</h2>
          <div style={{ height: '200px' }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'nivo' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 36,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Detail Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DetailTable title="Emails Sent" data={detailData.emails} />
        <DetailTable title="Questions Answered" data={detailData.questions} />
        <DetailTable title="Social Posts" data={detailData.socialPosts} />
        <DetailTable title="Content Added" data={detailData.content} />
      </div>
    </div>
  );
} 