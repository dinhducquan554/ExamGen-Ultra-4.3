import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';

// Icon from components/icons.tsx to avoid dependency issues and keep it self-contained.
const CheckCircle2: React.FC<{ className?: string, size?: number }> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

interface ToastMessage {
  id: string;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

const Toast: React.FC<{ id: string; message: string; onDismiss: (id: string) => void }> = ({ id, message, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showTimeout = setTimeout(() => setVisible(true), 10); // for entry animation
        const hideTimeout = setTimeout(() => {
            setVisible(false);
            const removeTimeout = setTimeout(() => onDismiss(id), 300); // wait for animation
            return () => clearTimeout(removeTimeout);
        }, 3000);

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
        };
    }, [id, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 w-full max-w-xs p-4 rounded-xl shadow-lg text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <CheckCircle2 className="w-5 h-5 text-green-400" size={20} />
            <div className="text-sm font-medium">{message}</div>
        </div>
    );
}

const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} onDismiss={removeToast} />
      ))}
    </div>
  );
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string) => {
    toastCounter += 1;
    const id = `toast-${Date.now()}-${toastCounter}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prevToasts) => [...prevToasts, { id, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
