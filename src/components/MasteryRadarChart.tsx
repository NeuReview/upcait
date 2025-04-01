import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

// Academic subjects data structure
interface SkillData {
  subject: string;
  [key: string]: any; // For multiple data points
}

interface MasteryRadarChartProps {
  data?: SkillData[];
  loading?: boolean;
}

// Fallback data in case real data is missing
const fallbackData: SkillData[] = [
  { 
    subject: 'Math', 
    'Student': 70, 
    'Class Average': 65, 
    'Target': 85 
  },
  { 
    subject: 'Science', 
    'Student': 75, 
    'Class Average': 60, 
    'Target': 80 
  },
  { 
    subject: 'Reading Comprehension', 
    'Student': 85, 
    'Class Average': 70, 
    'Target': 90 
  },
  { 
    subject: 'Language Proficiency', 
    'Student': 80, 
    'Class Average': 75, 
    'Target': 85 
  }
];

// Colors for each data series
const seriesColors: Record<string, string> = {
  'Student': '#6B46C1',  // Purple
  'Class Average': '#4299E1',  // Blue
  'Target': '#48BB78',  // Green
};

const MasteryRadarChart: React.FC<MasteryRadarChartProps> = ({ data, loading = false }) => {
  // Use data if available and not empty, otherwise use fallback
  const chartData = (data && data.length > 0) ? data : fallbackData;
  const series = Object.keys(seriesColors);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-neural p-4 mb-6 w-full">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-neural p-4 mb-6 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Mastery</h3>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">No assessment data available</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="70%" 
              data={chartData}
              margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid gridType="polygon" stroke="#E2E8F0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#4A5568', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={45}
                domain={[0, 100]} // 0-100 scale for percentages
                tick={{ fill: '#4A5568', fontSize: 10 }}
                axisLine={false}
              />
              
              {/* Create a radar for each data series with its own color */}
              {series.map(s => (
                <Radar
                  key={s}
                  name={s}
                  dataKey={s}
                  stroke={seriesColors[s]}
                  fill={seriesColors[s]}
                  fillOpacity={0.2}
                  activeDot={{ r: 4 }}
                  strokeWidth={2}
                />
              ))}
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                }}
                formatter={(value) => [`${value}%`, '']}
              />
              <Legend 
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MasteryRadarChart; 