import { useState, useCallback, createContext, useContext, useRef } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const showToast = useCallback((msg) => {
    const id = counter.current++;
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2700);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className="fixed bottom-[22px] right-[22px] z-[300] flex flex-col gap-2.5 items-end">
        {toasts.map(t => (
          <div
            key={t.id}
            className="bg-[#1A1A2E] text-white text-[13px] font-semibold px-[18px] py-3 rounded-[10px] shadow-[0_10px_26px_rgba(20,10,40,0.25)] max-w-[320px] animate-fade-in"
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
