import React from 'react';

interface BankSelectorProps {
  selectedBank: string;
  onBankChange: (bank: string) => void;
  banks: Array<{ value: string; label: string }>;
}

const BankSelector: React.FC<BankSelectorProps> = ({ selectedBank, onBankChange, banks }) => {
  return (
    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
      <label className="flex flex-col min-w-40 flex-1">
        <select
          value={selectedBank}
          onChange={(e) => onBankChange(e.target.value)}
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#121a0f] focus:outline-0 focus:ring-0 border border-[#d6e5d2] bg-[#f9fbf9] focus:border-[#d6e5d2] h-14 bg-[image:--select-button-svg] placeholder:text-[#639155] p-[15px] text-base font-normal leading-normal"
          style={{
            '--select-button-svg': `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(99,145,85)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')`,
             borderRadius: '0.5rem'  
        } as React.CSSProperties}
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
