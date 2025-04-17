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

import "./App.css";

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
    <div className="app">
      <h1>USD to LKR Exchange Rate</h1>
      <h2>Sampath Bank</h2>
      {latestRate ? (
        <div>
          <p>
            <strong>Latest Rate:</strong> {latestRate.rate}
          </p>
          <p>
            <strong>Fetched At:</strong>{" "}
            {new Date(latestRate.fetchedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>Loading latest rate...</p>
      )}

      <h2>History (Last 7 entries)</h2>
      <ul>
        {history.map((rate, idx) => (
          <li key={idx}>
            {rate.rate} at {new Date(rate.fetchedAt).toLocaleString()}
          </li>
        ))}
      </ul>

      <h2>Exchange Rate Chart (Last 7 entries)</h2>
      <div style={{ width: "80%", height: "400px" }}>
        <Line data={chartData} />
      </div>
      <footer
        style={{
          marginTop: "2rem",
          padding: "1rem",
          textAlign: "center",
          borderTop: "1px solid #ccc",
        }}
      >
        <p>Built by Chameera Rupasinghe</p>
        <a href="https://github.com/chameerar/usd-lkr-exchange-rate-dashboard">
          Source code
        </a>
        <div
          className="footer-icons"
          style={{
            marginTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <a
            href="https://github.com/chameerar"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/chameerarupasinghe/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://chameerar.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMedium size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
