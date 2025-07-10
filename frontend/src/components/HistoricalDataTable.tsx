import React from 'react';

interface HistoricalDataTableProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
}

const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ data }) => {
  return (
    <div className="px-4 py-3">
      <h2 className="text-[#121a0f] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">
        Last 10 Days
      </h2>
      <div className="flex overflow-hidden rounded-lg border border-[#d6e5d2] bg-[#f9fbf9]">
        <table className="flex-1">
          <thead>
            <tr className="bg-[#f9fbf9]">
              <th className="px-4 py-3 text-left text-[#121a0f] w-[400px] text-sm font-medium leading-normal">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[#121a0f] w-[400px] text-sm font-medium leading-normal">
                Exchange Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, index) => (
              <tr key={index} className="border-t border-t-[#d6e5d2]">
                <td className="h-[72px] px-4 py-2 w-[400px] text-[#639155] text-sm font-normal leading-normal">
                  {new Date(item.date).toISOString().split('T')[0]}
                </td>
                <td className="h-[72px] px-4 py-2 w-[400px] text-[#639155] text-sm font-normal leading-normal">
                  {item.rate.toFixed(2)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr className="border-t border-t-[#d6e5d2]">
                <td colSpan={2} className="h-[72px] px-4 py-2 text-[#639155] text-sm font-normal leading-normal text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalDataTable;
