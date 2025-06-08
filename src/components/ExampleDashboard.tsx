'use client';

import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveCalendar } from '@nivo/calendar';
import { subDays, format } from 'date-fns';

// Sample data for the line chart
const lineData = [
  {
    id: "email_broadcasts",
    data: [
      { x: "2024-01", y: 24 },
      { x: "2024-02", y: 35 },
      { x: "2024-03", y: 42 },
      { x: "2024-04", y: 38 },
    ]
  },
  {
    id: "announcement_downloads",
    data: [
      { x: "2024-01", y: 15 },
      { x: "2024-02", y: 22 },
      { x: "2024-03", y: 28 },
      { x: "2024-04", y: 31 },
    ]
  }
];

// Sample data for the pie chart
const pieData = [
  { id: 'Email Broadcasts', value: 139 },
  { id: 'Announcement Downloads', value: 96 },
  { id: 'User Registrations', value: 72 },
  { id: 'Document Uploads', value: 48 },
];

// Generate sample calendar data
const generateCalendarData = () => {
  const data = [];
  for (let i = 365; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      day: format(date, 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 10)
    });
  }
  return data;
};

export default function ExampleDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Valuable Moments Dashboard</h1>
      
      {/* Grid layout for charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
          <div className="h-[300px]">
            <ResponsiveLine
              data={lineData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                tickSize: 5,
                tickRotation: 0,
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableGridX={false}
              curve="monotoneX"
            />
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Activity Distribution</h2>
          <div className="h-[300px]">
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'nivo' }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
            />
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="bg-white p-4 rounded-lg shadow-lg md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Activity Calendar</h2>
          <div className="h-[200px]">
            <ResponsiveCalendar
              data={generateCalendarData()}
              from={subDays(new Date(), 365).toISOString()}
              to={new Date().toISOString()}
              emptyColor="#eeeeee"
              colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              yearSpacing={40}
              monthBorderColor="#ffffff"
              dayBorderWidth={2}
              dayBorderColor="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 