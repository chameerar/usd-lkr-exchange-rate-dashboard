import React from 'react';

interface BankSelectorProps {
  selectedBank: string;
  onBankChange: (bank: string) => void;
  banks: Array<{ value: string; label: string }>;
}

const BankSelector: React.FC<BankSelectorProps> = ({ selectedBank, onBankChange, banks }) => {
  return (
    <div className="bank-selector">
      <label className="bank-selector__label">
        <select
          value={selectedBank}
          onChange={(e) => onBankChange(e.target.value)}
          className="bank-selector__select"
        >
          {banks.map((bank) => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default BankSelector;
