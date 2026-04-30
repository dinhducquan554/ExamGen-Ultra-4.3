import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'border-transparent bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    danger: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    info: 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};