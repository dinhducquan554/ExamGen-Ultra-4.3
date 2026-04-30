import React from 'react';

type RadioProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Radio: React.FC<RadioProps> = ({ className, ...props }) => {
  return (
    <input
      type="radio"
      className={`h-4 w-4 shrink-0 rounded-full border border-gray-300 dark:border-gray-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600 text-blue-600 dark:checked:bg-blue-500 dark:checked:border-blue-500 ${className}`}
      {...props}
    />
  );
};
