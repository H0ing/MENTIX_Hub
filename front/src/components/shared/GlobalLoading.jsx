import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LoadingContext = createContext();

let _show = null;
let _hide = null;

export function showLoader() { _show?.(); }
export function hideLoader() { _hide?.(); }

export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0);

  const show = useCallback(() => setCount(c => c + 1), []);
  const hide = useCallback(() => setCount(c => Math.max(0, c - 1)), []);

  useEffect(() => { _show = show; _hide = hide; return () => { _show = null; _hide = null; }; }, [show, hide]);

  return (
    <LoadingContext.Provider value={{ loading: count > 0 }}>
      {children}
      {count > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl flex flex-col items-center gap-4 min-w-[180px]">
            <div className="w-10 h-10 border-[3px] border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#1A1A2E] text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
