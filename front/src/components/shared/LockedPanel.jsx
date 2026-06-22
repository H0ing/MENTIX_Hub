/**
 * LockedPanel — shown when the current user's role cannot access a page or tab.
 */
export default function LockedPanel({ message = 'You do not have permission to access this section.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-full bg-[#F0EAFC] flex items-center justify-center">
        <svg className="w-7 h-7 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-[#1A1A2E] m-0 mb-1">Access Restricted</p>
        <p className="text-[13px] text-[#8B8B9E] m-0 max-w-[340px]">{message}</p>
      </div>
    </div>
  );
}
