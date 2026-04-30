import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronRight } from '../icons';

const SelectContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string, children: React.ReactNode) => void;
  selectedChildren: React.ReactNode;
} | null>(null);

export const Select: React.FC<{
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}> = ({ children, onValueChange, disabled, value: controlledValue, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : internalValue;
  
  const findChildrenByValue = (valueToFind: string | undefined): React.ReactNode => {
    if (!valueToFind) return null;
    let foundChildren: React.ReactNode = null;
    
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectContent) {
            React.Children.forEach(child.props.children, (item) => {
                if(React.isValidElement(item) && item.type === SelectItem && item.props.value === valueToFind) {
                    foundChildren = item.props.children;
                }
            });
        }
    });
    return foundChildren;
  };
  
  const [selectedChildren, setSelectedChildren] = useState<React.ReactNode>(() => findChildrenByValue(selectedValue));

  useEffect(() => {
    setSelectedChildren(findChildrenByValue(selectedValue));
  }, [selectedValue, children]);

  const handleValueChange = (newValue: string, newChildren: React.ReactNode) => {
      if (!isControlled) {
          setInternalValue(newValue);
      }
      setSelectedChildren(newChildren);
      if (onValueChange) {
          onValueChange(newValue);
      }
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, setSelectedValue: handleValueChange, selectedChildren }}>
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  if (!context) throw new Error('SelectTrigger must be used within a Select');

  const { open, setOpen } = context;

  const child = React.Children.only(children) as React.ReactElement;

  return (
    <button
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {child}
      <ChevronRight className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-90' : ''}`} />
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectValue must be used within a Select');
    const { selectedValue, selectedChildren } = context;
    
    // FIX: Added parentheses to clarify the order of operations between '??' and '||' to resolve the linter error.
    // The logic is to display selectedChildren if available, otherwise fallback to selectedValue, and finally to placeholder.
    return <span>{selectedChildren ?? (selectedValue || placeholder)}</span>;
}


export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) throw new Error('SelectContent must be used within a Select');

  const { open, setOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-1 animate-in fade-in-0 zoom-in-95 ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className,
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select');
  const { setSelectedValue, setOpen } = context;

  return (
    <div
      onClick={() => {
        setSelectedValue(value, children);
        setOpen(false);
      }}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 dark:focus:bg-slate-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 ${className}`}
    >
      {children}
    </div>
  );
};