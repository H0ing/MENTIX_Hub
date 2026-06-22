const variants = {
  primary:  'bg-[#7C3AED] hover:bg-[#6425D0] text-white border-transparent',
  default:  'bg-white hover:bg-[#F7F5FF] text-[#1A1A2E] border-[#ECE9F4]',
  danger:   'bg-[#FDEAF0] hover:bg-red-100  text-[#E0245E] border-transparent',
  ghost:    'bg-transparent hover:bg-[#F7F5FF] text-[#7C3AED] border-transparent',
};

export default function Button({ children, variant = 'default', disabled = false, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] border
        text-[13px] font-semibold cursor-pointer transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] ?? variants.default}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
