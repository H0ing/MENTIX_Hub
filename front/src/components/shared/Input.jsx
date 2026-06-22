import { useState } from 'react';

const base = 'w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none text-[#1A1A2E] focus:border-[#7C3AED] transition-colors';

export function Input({ label, id, type, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          className={`${base}${isPassword ? ' pr-10' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B9E] hover:text-[#1A1A2E] transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function Select({ label, id, children, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">
          {label}
        </label>
      )}
      <select id={id} className={base} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, id, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">
          {label}
        </label>
      )}
      <textarea id={id} className={`${base} min-h-[90px] resize-y font-inherit`} {...props} />
    </div>
  );
}
