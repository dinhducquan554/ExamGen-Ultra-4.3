import React from 'react';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({ className, onCheckedChange, ...props }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };
  
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 shrink-0 rounded-sm border border-slate-300 dark:border-slate-600 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-indigo-600 checked:border-indigo-600 text-indigo-600 dark:checked:bg-indigo-500 dark:checked:border-indigo-500 ${className}`}
      onChange={handleChange}
      {...props}
    />
  );
};