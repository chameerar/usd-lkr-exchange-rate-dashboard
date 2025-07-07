import React, { useState, useEffect } from "react";

const banks = [
  { id: "bank1", name: "Bank of Ceylon" },
  { id: "bank2", name: "Commercial Bank" },
  { id: "bank3", name: "Sampath Bank" },
];

type Granularity = "Day" | "Week" | "Month";

type RateHistoryEntry = {
  date: string;
  rate: number;
};

const generateMockRateHistory = (granularity: Granularity): RateHistoryEntry[] => {
  const today = new Date();
  const history: RateHistoryEntry[] = [];
  const daysCount = granularity === "Day" ? 10 : granularity === "Week" ? 10 * 7 : 10 * 30;

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    history.push({
      date: date.toISOString().slice(0, 10),
      rate: 360 + Math.sin(i / 3) * 5 + Math.random() * 2,
    });
  }
  return history;
};

const groupRatesByGranularity = (history: RateHistoryEntry[], granularity: Granularity) => {
  if (granularity === "Day") return history;

  const grouped: { [key: string]: { sum: number; count: number } } = {};

  history.forEach(({ date, rate }) => {
    const d = new Date(date);
    let key = "";
    if (granularity === "Week") {
      // Get year-week string
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${weekNumber}`;
    } else if (granularity === "Month") {
      key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
    grouped[key].sum += rate;
    grouped[key].count++;
  });

  return Object.entries(grouped).map(([key, { sum, count }]) => ({
    date: key,
    rate: sum / count,
  }));
};

export default function UsdToLkrExchange() {
  const [selectedBank, setSelectedBank] = useState(banks[0].id);
  const [currentRate, setCurrentRate] = useState(0);
  const [granularity, setGranularity] = useState<Granularity>("Day");
  const [rateHistory, setRateHistory] = useState<RateHistoryEntry[]>([]);

  useEffect(() => {
    // Simulate fetching current rate for selected bank
    // For demo, just randomize around 360-370
    const baseRate = 365 + (banks.find((b) => b.id === selectedBank)?.id.charCodeAt(0) ?? 0) % 5;
    const newRate = baseRate + Math.random() * 3 - 1.5;
    setCurrentRate(parseFloat(newRate.toFixed(3)));

    // Simulate fetching rate history
    const history = generateMockRateHistory("Day");
    setRateHistory(history);
  }, [selectedBank]);

  const chartData = groupRatesByGranularity(rateHistory, granularity);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-gray-900">USD to LKR Exchange</h1>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
        <label htmlFor="bank" className="block text-gray-700 font-medium">
          Select Bank
        </label>
        <select
          id="bank"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
        >
          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>

        <div className="ml-auto text-right">
          <p className="text-gray-500 text-sm">Current Rate</p>
          <div className="relative inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl shadow-2xl transform transition-transform hover:scale-110">
            <p className="text-5xl font-extrabold text-white drop-shadow-xl tracking-wide">
              {currentRate.toFixed(3)}
            </p>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-2 bg-white rounded-full opacity-60 blur-md" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-4 mb-4">
          <span className="font-medium text-gray-700">Granularity:</span>
          {(["Day", "Week", "Month"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1 rounded-md font-semibold ${
                granularity === g
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {/* Chart */}
          <RateChart data={chartData} granularity={granularity} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Rate History (Last 10 Days)</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate (USD to LKR)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rateHistory.slice(-10).map(({ date, rate }) => (
                <tr key={date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                    {rate.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type RateChartProps = {
  data: { date: string; rate: number }[];
  granularity: Granularity;
};

function RateChart({ data, granularity }: RateChartProps) {
  // We will create a simple line chart using SVG and Tailwind for styling.
  // The chart will scale horizontally and vertically based on data.

  if (data.length === 0) {
    return <p className="text-center text-gray-500 py-10">No data available</p>;
  }

  // Chart dimensions
  const width = 600;
  const height = 250;
  const padding = 40;

  // Extract rates and dates
  const rates = data.map((d) => d.rate);
  const dates = data.map((d) => d.date);

  // Calculate scales
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const rateRange = maxRate - minRate || 1;

  // Horizontal scale: evenly spaced points
  const pointCount = data.length;
  const xStep = (width - 2 * padding) / (pointCount - 1);

  // Map data points to SVG coordinates
  const points = data.map((d, i) => {
    const x = padding + i * xStep;
    const y = padding + ((maxRate - d.rate) / rateRange) * (height - 2 * padding);
    return { x, y };
  });

  // Create path string for line
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // X axis labels: show first, last, and some in between depending on granularity
  const labelCount = 5;
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.floor((pointCount - 1) * (i / (labelCount - 1)))
  );

  // Format date labels based on granularity
  const formatLabel = (dateStr: string) => {
    if (granularity === "Day") return dateStr.slice(5);
    if (granularity === "Week") return dateStr.replace("W", "Wk ");
    if (granularity === "Month") return dateStr.slice(0, 7);
    return dateStr;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-64"
      role="img"
      aria-label="Exchange rate history chart"
    >
      {/* Background */}
      <rect width={width} height={height} fill="white" rx={8} ry={8} />

      {/* Y axis lines and labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding + t * (height - 2 * padding);
        const rateValue = (maxRate - t * rateRange).toFixed(2);
        return (
          <g key={t}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <text
              x={padding - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
              fontFamily="ui-sans-serif, system-ui"
            >
              {rateValue}
            </text>
          </g>
        );
      })}

      {/* X axis line */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#6b7280"
        strokeWidth={1}
      />

      {/* X axis labels */}
      {labelIndices.map((idx) => {
        const x = padding + idx * xStep;
        return (
          <text
            key={idx}
            x={x}
            y={height - padding + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
            fontFamily="ui-sans-serif, system-ui"
          >
            {formatLabel(dates[idx])}
          </text>
        );
      })}

      {/* Line path */}
      <path
        d={pathD}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#4f46e5"
          stroke="white"
          strokeWidth={1}
          tabIndex={0}
          aria-label={`Rate on ${dates[i]}: ${rates[i].toFixed(3)}`}
        />
      ))}
    </svg>
  );
}
