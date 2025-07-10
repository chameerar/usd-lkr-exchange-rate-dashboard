import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  percentage: number;
  period: string;
  trend: 'up' | 'down';
}

interface ChartDataPoint {
  date: string;
  rate: number;
}

interface ExchangeRateTrendProps {
  trendData: TrendData;
  chartData: ChartDataPoint[];
}

const ExchangeRateTrend: React.FC<ExchangeRateTrendProps> = ({ trendData, chartData }) => {
  // Prepare chart data
  const chartConfig = {
    labels: chartData.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Exchange Rate',
        data: chartData.map(point => point.rate),
        borderColor: '#639155',
        backgroundColor: 'rgba(235, 242, 233, 0.5)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#639155',
        pointBorderColor: '#639155',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18, 26, 15, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#639155',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Rate: ${context.parsed.y.toFixed(2)} LKR`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#639155',
          font: {
            size: 11,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  } as const;

  return (
    <div className="flex flex-wrap gap-4 px-4 py-6">
      <div className="flex min-w-72 flex-1 flex-col gap-2">
        <p className="text-[#121a0f] text-base font-medium leading-normal">Exchange Rate Trend</p>
        <p className="text-[#121a0f] tracking-light text-[32px] font-bold leading-tight truncate">
          {trendData.trend === 'up' ? '+' : ''}{trendData.percentage.toFixed(1)}%
        </p>
        <div className="flex gap-1">
          <p className="text-[#639155] text-base font-normal leading-normal">{trendData.period}</p>
          <p className={`text-base font-medium leading-normal ${
            trendData.trend === 'up' ? 'text-[#078821]' : 'text-[#d32f2f]'
          }`}>
            {trendData.trend === 'up' ? '+' : ''}{trendData.percentage.toFixed(1)}%
          </p>
        </div>
        <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
          {chartData.length > 0 ? (
            <div className="h-[148px] w-full">
              <Line data={chartConfig} options={chartOptions} />
            </div>
          ) : (
            <div className="h-[148px] w-full flex items-center justify-center text-[#639155]">
              No chart data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateTrend;
