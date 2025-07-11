import React from 'react';

interface ExchangeRateCardProps {
  rate: number;
  label?: string;
  isLoading?: boolean;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ 
  rate, 
  label = "Current Exchange Rate", 
  isLoading = false 
}) => {
  return (
    <div className="exchange-rate-card">
      <div className="exchange-rate-card__content">
        <p className="exchange-rate-card__label">
          {label}
        </p>
        <p className="exchange-rate-card__rate">
          {isLoading ? (
            <>
              <span className="skeleton-text skeleton-text--large" style={{ display: 'inline-block', width: '180px', height: '3rem' }}>----.--</span>
              <span> </span>
              <span className="exchange-rate-card__currency skeleton-text" style={{ display: 'inline-block', width: '60px', height: '1.875rem' }}>LKR</span>
            </>
          ) : (
            <>
              {rate.toFixed(2)} <span className="exchange-rate-card__currency">LKR</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
