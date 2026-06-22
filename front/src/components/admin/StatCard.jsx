export default function StatCard({ label, value, sub, barPct, barWarn = false }) {
  return (
    <div className="bg-white border border-[#ECE9F4] rounded-[14px] px-5 py-[18px]">
      <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">{label}</div>
      <div className="text-[24px] font-black text-[#1A1A2E]">{value}</div>
      {barPct !== undefined && (
        <div className={`h-1.5 rounded-full bg-[#ECE9F4] mt-2.5 overflow-hidden`}>
          <i className={`block h-full rounded-full ${barWarn ? 'bg-[#E0245E]' : 'bg-[#7C3AED]'}`} style={{ width: `${barPct}%` }} />
        </div>
      )}
      {sub && <div className="text-[12px] text-[#8B8B9E] mt-1.5">{sub}</div>}
    </div>
  );
}
