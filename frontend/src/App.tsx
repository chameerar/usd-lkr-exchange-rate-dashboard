import { useEffect, useState } from "react";
import axios from "axios";
import BankSelector from "./components/BankSelector";
import ExchangeRateCard from "./components/ExchangeRateCard";
import TimePeriodSelector from "./components/TimePeriodSelector";
import ExchangeRateTrend from "./components/ExchangeRateTrend";
import HistoricalDataTable from "./components/HistoricalDataTable";

// Bank constants (matching backend)
const BANKS = {
  SAMPATH: 'SAMPATH',
  COMMERCIAL: 'COMMERCIAL',
  HNB: 'HNB',
  NSB: 'NSB',
  SEYLAN: 'SEYLAN',
  NATION: 'NATION'
} as const;

// Available banks
const AVAILABLE_BANKS = [
  { value: BANKS.SAMPATH, label: 'Sampath Bank' }
];

interface ExchangeRate {
  rate: number;
  fetchedAt: string;
  bank?: string;
}

type TimePeriod = 'Week' | 'Month' | 'Year';

declare global {
  interface Window {
    configs: {
      backendUrl?: string;
    };
  }
}

function App() {
  const [latestRate, setLatestRate] = useState<ExchangeRate | null>(null);
  const [history, setHistory] = useState<ExchangeRate[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>(BANKS.SAMPATH);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Week');
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = window.configs?.backendUrl || 'http://localhost:8080';

  // Mock data for testing when backend is not available
  const generateMockData = () => {
    const mockData = [];
    const baseRate = 300;
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const rate = baseRate + Math.random() * 20 - 10; // Random variation
      mockData.push({
        rate: rate,
        fetchedAt: date.toISOString(),
        bank: selectedBank
      });
    }
    
    return mockData;
  };

  const fetchLatestRate = async (bank?: string) => {
    try {
      setLoading(true);
      const bankParam = bank ? `?bank=${bank}` : '';
      const res = await axios.get<ExchangeRate>(`${backendUrl}/latest-rate${bankParam}`);
      setLatestRate(res.data);
    } catch (err) {
      console.error("Failed to fetch latest rate:", err);
      // Use mock data for testing
      const mockData = generateMockData();
      setLatestRate(mockData[mockData.length - 1]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryWithPeriod = async (bank?: string, period?: TimePeriod) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (bank) params.append('bank', bank);
      if (period) params.append('period', period.toLowerCase());
      
      const queryString = params.toString();
      const url = `${backendUrl}/history${queryString ? `?${queryString}` : ''}`;
      
      const res = await axios.get<ExchangeRate[]>(url);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history with period:", err);
      // Use mock data for testing, filtered by period
      const mockData = generateMockDataForPeriod(period || 'Month');
      setHistory(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDataForPeriod = (period: TimePeriod) => {
    const mockData = [];
    const baseRate = 300;
    const now = new Date();
    
    let days: number;
    switch (period) {
      case 'Week':
        days = 7;
        break;
      case 'Month':
        days = 30;
        break;
      case 'Year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    // Generate data points based on the period
    const dataPoints = Math.min(days, 50); // Cap at 50 points for performance
    const stepSize = Math.floor(days / dataPoints);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * stepSize));
      const rate = baseRate + Math.random() * 20 - 10; // Random variation
      mockData.push({
        rate: rate,
        fetchedAt: date.toISOString(),
        bank: selectedBank
      });
    }
    
    return mockData;
  };

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank);
    fetchLatestRate(bank);
    fetchHistoryWithPeriod(bank, selectedPeriod);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    // Filter existing history data based on the selected period
    filterHistoryByPeriod(period);
  };

  const filterHistoryByPeriod = (period: TimePeriod) => {
    // If we have history data, filter it based on the period
    if (history.length === 0) return;

    // For now, we'll refetch data with period parameter
    // In a real app, you might want to cache all data and filter client-side
    fetchHistoryWithPeriod(selectedBank, period);
  };

  useEffect(() => {
    fetchLatestRate(selectedBank);
    fetchHistoryWithPeriod(selectedBank, selectedPeriod);
  }, []);

  // Calculate trend data based on selected period
  const calculateTrend = () => {
    if (history.length < 2) return { percentage: 0, period: `Last ${selectedPeriod}`, trend: 'up' as const };
    
    const previous = history[history.length - 1]?.rate || 0;
    const current = history[0]?.rate || 0;
    const percentage = ((current - previous) / previous) * 100;
    
    return {
      percentage: Math.abs(percentage),
      period: `Last ${selectedPeriod}`,
      trend: percentage >= 0 ? 'up' as const : 'down' as const
    };
  };

  // Transform history data for table and chart
  const tableData = history.map(item => ({
    date: item.fetchedAt,
    rate: item.rate
  }));

  const chartData = history.slice().reverse().map(item => ({
    date: item.fetchedAt,
    rate: item.rate
  }));

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] group/design-root overflow-x-hidden"
      style={{
        '--select-button-svg': `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(99,145,85)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')`,
        fontFamily: 'Manrope, "Noto Sans", sans-serif'
      } as React.CSSProperties}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-20 md:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4 pt-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#121a0f] tracking-light text-[40px] font-bold leading-tight">
                  USD to LKR Exchange Rates
                </h1>
                <p className="text-[#639155] text-lg font-medium">
                  Real-time Currency Exchange
                </p>
              </div>
            </div>

            <div className="mb-8" style={{ marginBottom: '1em' }}>
              <BankSelector
                selectedBank={selectedBank}
                onBankChange={handleBankChange}
                banks={AVAILABLE_BANKS}
              />
            </div>
            
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-[#639155] text-lg">Loading...</div>
              </div>
            ) : (
              <>
                {latestRate && (
                  <div className="mb-8" style={{ marginBottom: '1em'}}>
                    <ExchangeRateCard rate={latestRate.rate} />
                  </div>
                )}
                
                <div className="mb-8">
                  <TimePeriodSelector 
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={handlePeriodChange}
                  />
                </div>
                
                <ExchangeRateTrend trendData={calculateTrend()} chartData={chartData} />
                
                <HistoricalDataTable data={tableData} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
