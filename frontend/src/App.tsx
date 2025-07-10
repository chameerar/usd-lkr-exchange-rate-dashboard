import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa";

// Bank constants (matching backend)
const BANKS = {
  SAMPATH: 'SAMPATH',
  COMMERCIAL: 'COMMERCIAL',
  HNB: 'HNB',
  NSB: 'NSB',
  SEYLAN: 'SEYLAN',
  NATION: 'NATION'
} as const;

// For now, we'll only show SAMPATH as requested
const AVAILABLE_BANKS = [
  { value: BANKS.SAMPATH, label: 'Sampath Bank' }
];

interface ExchangeRate {
  rate: number;
  fetchedAt: string;
  bank?: string;
}

declare global {
  interface Window {
    configs: {
      backendUrl?: string;
    };
  }
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [latestRate, setLatestRate] = useState<ExchangeRate | null>(null);
  const [history, setHistory] = useState<ExchangeRate[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>(BANKS.SAMPATH);
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = window.configs.backendUrl;

  const fetchLatestRate = async (bank?: string) => {
    try {
      setLoading(true);
      const bankParam = bank ? `?bank=${bank}` : '';
      const res = await axios.get<ExchangeRate>(`${backendUrl}/latest-rate${bankParam}`);
      setLatestRate(res.data);
    } catch (err) {
      console.error("Failed to fetch latest rate:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (bank?: string) => {
    try {
      setLoading(true);
      const bankParam = bank ? `?bank=${bank}` : '';
      const res = await axios.get<ExchangeRate[]>(`${backendUrl}/history${bankParam}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank);
    fetchLatestRate(bank);
    fetchHistory(bank);
  };

  const handleRefresh = () => {
    fetchLatestRate(selectedBank);
    fetchHistory(selectedBank);
  };

  useEffect(() => {
    fetchLatestRate(selectedBank);
    fetchHistory(selectedBank);
  }, []);  // Initial load with default bank

  const chartHistory = history.slice().reverse(); 
  // Prepare chart data
  const chartData = {
    labels: chartHistory.map((rate) => new Date(rate.fetchedAt).toLocaleString()),
    datasets: [
      {
        label: `USD to LKR Exchange Rate - ${AVAILABLE_BANKS.find(b => b.value === selectedBank)?.label || selectedBank}`,
        data: chartHistory.map((rate) => rate.rate),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto p-8 text-center min-h-screen">
      <h1 className="text-5xl font-bold leading-tight mb-4 text-white">USD to LKR Exchange Rate</h1>
      
      {/* Bank Selection Dropdown */}
      <div className="mb-8">
        <label htmlFor="bank-select" className="block text-xl font-semibold mb-4 text-white">
          Select Bank:
        </label>
        <div className="flex items-center justify-center gap-4">
          <select
            id="bank-select"
            value={selectedBank}
            onChange={(e) => handleBankChange(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-lg rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block 
                     w-64 p-3 transition-all duration-200 hover:border-gray-500"
          >
            {AVAILABLE_BANKS.map((bank) => (
              <option key={bank.value} value={bank.value} className="bg-gray-800 text-white">
                {bank.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                     text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200
                     focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <h2 className="text-3xl font-semibold mb-8 text-white">
        {AVAILABLE_BANKS.find(b => b.value === selectedBank)?.label || selectedBank}
      </h2>
      
      {loading ? (
        <div className="mb-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <p className="text-xl text-white">Loading...</p>
        </div>
      ) : latestRate ? (
        <div className="mb-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <p className="text-xl mb-2 text-white">
            <strong>Latest Rate:</strong> LKR {latestRate.rate.toFixed(2)}
          </p>
          <p className="text-xl text-white">
            <strong>Fetched At:</strong>{" "}
            {new Date(latestRate.fetchedAt).toLocaleString()}
          </p>
          {latestRate.bank && (
            <p className="text-sm text-gray-300 mt-2">
              Source: {latestRate.bank}
            </p>
          )}
        </div>
      ) : (
        <p className="text-lg mb-8 text-white">Loading latest rate...</p>
      )}

      <h2 className="text-3xl font-semibold mb-6 text-white">History</h2>
      <ul className="list-none mb-8 space-y-2 max-h-60 overflow-y-auto bg-gray-800 rounded-lg p-4 border border-gray-700">
        {history.length > 0 ? (
          history.map((rate, idx) => (
            <li key={idx} className="text-gray-300 py-1 border-b border-gray-700 last:border-b-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold">LKR {rate.rate.toFixed(2)}</span>
                <span className="text-sm">
                  {new Date(rate.fetchedAt).toLocaleString()}
                  {rate.bank && ` - ${rate.bank}`}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 py-4">No history available for selected bank</li>
        )}
      </ul>

      <h2 className="text-3xl font-semibold mb-6 text-white">Exchange Rate Chart</h2>
      <div className="w-4/5 h-96 mx-auto mb-8 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <Line data={chartData} />
      </div>
      <footer className="mt-8 pt-4 text-center border-t border-gray-600">
        <p className="mb-2 text-gray-300">Built by Chameera Rupasinghe</p>
        <a 
          href="https://github.com/chameerar/usd-lkr-exchange-rate-dashboard"
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-block mb-2 font-medium"
        >
          Source code
        </a>
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/chameerar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/chameerarupasinghe/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://chameerar.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FaMedium size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
