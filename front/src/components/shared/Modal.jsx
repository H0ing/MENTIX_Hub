import { useEffect, useRef } from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
      className="fixed inset-0 bg-[rgba(26,26,46,0.42)] backdrop-blur-[1px] flex items-center justify-center z-[200]"
    >
      <div
        className="bg-white rounded-[14px] w-[440px] max-w-[92vw] max-h-[86vh] overflow-y-auto shadow-[0_24px_60px_rgba(30,20,60,0.25)]"
        style={{ animation: 'modalIn 0.15s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#ECE9F4]">
          <h3 className="m-0 text-[16px] font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8B8B9E] text-lg hover:bg-[#F7F5FF] hover:text-[#1A1A2E] cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-[22px] py-[20px] text-[13.5px] leading-[1.55]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2.5 px-[22px] py-[16px] border-t border-[#ECE9F4]">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
