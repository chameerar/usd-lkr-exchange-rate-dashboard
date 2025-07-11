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
  isLoading?: boolean;
}

const ExchangeRateTrend: React.FC<ExchangeRateTrendProps> = ({ trendData, chartData, isLoading = false }) => {
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
    <div className="exchange-rate-trend">
      <div className="exchange-rate-trend__content">
        <p className="exchange-rate-trend__title">
          Exchange Rate Trend
        </p>
        <p className="exchange-rate-trend__percentage">
          {isLoading ? (
            <span className="skeleton-text skeleton-text--large" style={{ display: 'inline-block', width: '120px', height: '2rem' }}>+0.0%</span>
          ) : (
            `${trendData.trend === 'up' ? '+' : ''}${trendData.percentage.toFixed(1)}%`
          )}
        </p>
        <div className="exchange-rate-trend__details">
          <p className="exchange-rate-trend__period">
            {isLoading ? (
              <span className="skeleton-text" style={{ display: 'inline-block', width: '100px', height: '1rem' }}>Last Period</span>
            ) : (
              trendData.period
            )}
          </p>
          <p className={`exchange-rate-trend__change ${
            trendData.trend === 'up' ? 'exchange-rate-trend__change--up' : 'exchange-rate-trend__change--down'
          }`}>
            {isLoading ? (
              <span className="skeleton-text" style={{ display: 'inline-block', width: '60px', height: '1rem' }}>+0.0%</span>
            ) : (
              `${trendData.trend === 'up' ? '+' : ''}${trendData.percentage.toFixed(1)}%`
            )}
          </p>
        </div>
        <div className="exchange-rate-trend__chart-container">
          {isLoading ? (
            <div className="exchange-rate-trend__chart-skeleton">
              <div className="chart-skeleton">
                <div className="chart-skeleton__bars">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="chart-skeleton__bar" style={{ height: `${Math.random() * 60 + 20}%` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="exchange-rate-trend__chart">
              <Line data={chartConfig} options={chartOptions} />
            </div>
          ) : (
            <div className="exchange-rate-trend__no-data">
              No chart data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateTrend;
