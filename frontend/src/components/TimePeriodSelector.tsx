import React from 'react';

type TimePeriod = 'Week' | 'Month' | 'Year';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: TimePeriod[] = ['Week', 'Month', 'Year'];

  return (
    <div className="time-period-selector">
      <div className="time-period-selector__container">
        {periods.map((period) => (
          <label
            key={period}
            className={`time-period-selector__option ${
              selectedPeriod === period ? 'time-period-selector__option--active' : ''
            }`}
          >
            <span className="time-period-selector__text">{period}</span>
            <input
              type="radio"
              name="time-period"
              className="time-period-selector__input"
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
