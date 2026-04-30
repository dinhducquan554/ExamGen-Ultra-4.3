
import React from 'react';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label: React.FC<LabelProps> = ({ className, children, ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};