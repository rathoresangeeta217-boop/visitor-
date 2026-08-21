import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  value: string;
  onChangeSelect: (value: string) => void;
  options: string[];
  icon?: React.ReactNode;
}

export function SelectInput({ label, value, onChangeSelect, options, icon, ...props }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          {icon}
        </div>
        <select
          {...props}
          value={value}
          onChange={(e) => onChangeSelect(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-lg font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
        >
          <option value="" disabled>Select person to meet</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 text-slate-400 pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}
