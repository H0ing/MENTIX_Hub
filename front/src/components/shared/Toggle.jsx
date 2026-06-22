export default function Toggle({ on, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!on)}
      className={`
        relative w-10 h-[22px] rounded-full flex-shrink-0 transition-colors
        ${disabled ? 'bg-[#E5E1F2] cursor-not-allowed' : on ? 'bg-[#7C3AED] cursor-pointer' : 'bg-[#D9D5E8] cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-150
          ${on ? 'left-[20px]' : 'left-[2px]'}
        `}
      />
    </button>
  );
}
