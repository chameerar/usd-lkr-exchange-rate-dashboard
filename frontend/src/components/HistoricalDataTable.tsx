import React from 'react';

interface HistoricalDataTableProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
}

const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ data }) => {
  return (
    <div className="historical-data-table">
      <h2 className="historical-data-table__title">
        Last 10 Days
      </h2>
      <div className="historical-data-table__container">
        <table className="historical-data-table__table">
          <thead>
            <tr className="historical-data-table__header">
              <th className="historical-data-table__header-cell">
                Date
              </th>
              <th className="historical-data-table__header-cell">
                Exchange Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, index) => (
              <tr key={index} className="historical-data-table__row">
                <td className="historical-data-table__cell">
                  {new Date(item.date).toISOString().split('T')[0]}
                </td>
                <td className="historical-data-table__cell">
                  {item.rate.toFixed(2)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr className="historical-data-table__row">
                <td colSpan={2} className="historical-data-table__cell historical-data-table__cell--center">
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
