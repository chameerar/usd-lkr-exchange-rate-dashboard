import React from 'react';

interface ExchangeRateCardProps {
  rate: number;
  label?: string;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ rate, label = "Current Exchange Rate" }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="flex min-w-[158px] flex-1 flex-col gap-4 rounded-lg p-8 bg-[#ebf2e9] shadow-sm" 
      style={{borderRadius: '0.5rem'}}>
        <p className="text-[#639155] text-xs font-medium leading-normal tracking-wide uppercase" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif', paddingLeft: '1em' }}>
          {label}
        </p>
        <p className="text-[#121a0f] tracking-tight text-5xl font-bold leading-none" 
        style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' , paddingLeft: '0.5em', fontSize: 'xxx-large',
         marginTop: 0, marginBottom: '0.25em' }}>
          {rate.toFixed(2)} <span className="text-3xl font-semibold text-[#639155]">LKR</span>
        </p>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
