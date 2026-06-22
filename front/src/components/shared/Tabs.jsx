export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-[22px] border-b border-[#ECE9F4] mb-[22px]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 pb-3 text-[13.5px] font-semibold border-b-2 -mb-px transition-colors
            ${active === tab.id
              ? 'text-[#7C3AED] border-[#7C3AED]'
              : 'text-[#8B8B9E] border-transparent hover:text-[#1A1A2E]'
            }
          `}
        >
          {tab.icon && <span className="text-[15px]">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
