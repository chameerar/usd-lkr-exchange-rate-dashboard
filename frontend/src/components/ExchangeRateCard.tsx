import React from 'react';

interface ExchangeRateCardProps {
  rate: number;
  label?: string;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ rate, label = "Current Exchange Rate" }) => {
  return (
    <div className="exchange-rate-card">
      <div className="exchange-rate-card__content">
        <p className="exchange-rate-card__label">
          {label}
        </p>
        <p className="exchange-rate-card__rate">
          {rate.toFixed(2)} <span className="exchange-rate-card__currency">LKR</span>
        </p>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
