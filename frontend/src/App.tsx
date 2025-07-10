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

interface ExchangeRate {
  rate: number;
  fetchedAt: string;
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
  const backendUrl = window.configs.backendUrl;

  const fetchLatestRate = async () => {
    try {
      const res = await axios.get<ExchangeRate>(`${backendUrl}/latest-rate`);
      setLatestRate(res.data);
    } catch (err) {
      console.error("Failed to fetch latest rate:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get<ExchangeRate[]>(`${backendUrl}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchLatestRate();
    fetchHistory();
  }, []);

  const chartHistory = history.slice().reverse(); 
  // Prepare chart data
  const chartData = {
    labels: chartHistory.map((rate) => new Date(rate.fetchedAt).toLocaleString()),
    datasets: [
      {
        label: "USD to LKR Exchange Rate",
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
      <h2 className="text-3xl font-semibold mb-8 text-white">Sampath Bank</h2>
      {latestRate ? (
        <div className="mb-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <p className="text-xl mb-2 text-white">
            <strong>Latest Rate:</strong> {latestRate.rate}
          </p>
          <p className="text-xl text-white">
            <strong>Fetched At:</strong>{" "}
            {new Date(latestRate.fetchedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-lg mb-8 text-white">Loading latest rate...</p>
      )}

      <h2 className="text-3xl font-semibold mb-6 text-white">History</h2>
      <ul className="list-none mb-8 space-y-2 max-h-60 overflow-y-auto bg-gray-800 rounded-lg p-4 border border-gray-700">
        {history.map((rate, idx) => (
          <li key={idx} className="text-gray-300 py-1 border-b border-gray-700 last:border-b-0">
            {rate.rate} at {new Date(rate.fetchedAt).toLocaleString()}
          </li>
        ))}
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
