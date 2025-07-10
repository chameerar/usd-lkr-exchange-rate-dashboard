import React from 'react';

type TimePeriod = 'Week' | 'Month' | 'Year';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: TimePeriod[] = ['Week', 'Month', 'Year'];

  return (
    <div className="flex px-4 py-3" >
      <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#ebf2e9] p-1" style={{ borderRadius: '0.5rem'}}>
        {periods.map((period) => (
          <label
            key={period}
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal ${
              selectedPeriod === period
                ? 'bg-[#f9fbf9] shadow-[0_0_4px_rgba(0,0,0,0.1)] text-[#121a0f]'
                : 'text-[#639155]'
            }`}
          >
            <span className="truncate">{period}</span>
            <input
              type="radio"
              name="time-period"
              className="invisible w-0"
              value={period}
              checked={selectedPeriod === period}
              onChange={() => onPeriodChange(period)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodSelector;
