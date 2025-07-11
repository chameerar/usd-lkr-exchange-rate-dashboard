import React from 'react';

interface HistoricalDataTableProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
  isLoading?: boolean;
}

const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ data, isLoading = false }) => {
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="historical-data-table__row">
        <td className="historical-data-table__cell">
          <span className="skeleton-text" style={{ display: 'inline-block', width: '80px', height: '0.875rem' }}>2024-01-01</span>
        </td>
        <td className="historical-data-table__cell">
          <span className="skeleton-text" style={{ display: 'inline-block', width: '60px', height: '0.875rem' }}>000.00</span>
        </td>
      </tr>
    ));
  };

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
            {isLoading ? (
              renderSkeletonRows()
            ) : (
              <>
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
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalDataTable;
