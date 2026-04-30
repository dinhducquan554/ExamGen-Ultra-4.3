import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export const Tabs: React.FC<{ 
  children: React.ReactNode; 
  defaultValue?: string; 
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}> = ({ children, defaultValue, className, value, onValueChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || "");
  
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;
  
  const setActiveTab = (newValue: string) => {
    if (!isControlled) {
      setInternalActiveTab(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 ${className}`}
  >
    {children}
  </div>
);

export const TabsTrigger: React.FC<{ children: React.ReactNode; value: string; className?: string, disabled?: boolean }> = ({
  children,
  value,
  className,
  disabled,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-sm' 
          : 'text-slate-500 dark:text-slate-400'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  const { activeTab } = context;
  return activeTab === value ? <div className={`mt-2 ${className}`}>{children}</div> : null;
};