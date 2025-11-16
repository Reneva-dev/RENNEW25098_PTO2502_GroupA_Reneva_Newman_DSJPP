import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info", undo = null) => {
    setToast({ message, type, undo });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
