import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";
import "./Toast.css";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, message, type, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className="g-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="g-toast-item">
            <Toast
              message={t.message}
              type={t.type}
              duration={t.duration}
              onClose={() => remove(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
