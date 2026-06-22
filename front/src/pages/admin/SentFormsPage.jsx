import { useState, useMemo } from 'react';
import MailDetailPanel from '../../components/admin/MailDetailPanel';
import { getSentForms } from '../../services/settingsService';

const TYPE_COLORS = {
  'System Notification': 'bg-[#F0EAFC] text-[#7C3AED]',
  'Promotion Notice':    'bg-[#E9F9EF] text-[#16A34A]',
  'Account Action':      'bg-[#FDEAF0] text-[#E0245E]',
};

export default function SentFormsPage() {
  const allForms  = getSentForms();
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected]   = useState(null);

  const types = useMemo(() => ['all', ...new Set(allForms.map(f => f.type))], []);

  const filtered = allForms.filter(f => {
    const matchType   = typeFilter === 'all' || f.type === typeFilter;
    const matchSearch = !search
      || f.subject.toLowerCase().includes(search.toLowerCase())
      || f.recipient.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Sent Forms</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">All system-generated notices sent to users.</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5 items-center flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#ECE9F4] rounded-[10px] px-3 py-[9px] flex-1 max-w-[340px]">
          <svg className="w-[14px] h-[14px] text-[#8B8B9E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject or recipient…"
            className="border-none bg-transparent outline-none text-[13px] w-full text-[#1A1A2E] placeholder:text-[#8B8B9E]"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]"
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>
          ))}
        </select>

        <span className="text-[12.5px] text-[#8B8B9E] ml-auto">
          {filtered.length} {filtered.length === 1 ? 'form' : 'forms'}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#ECE9F4] rounded-[14px] overflow-hidden">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['Subject', 'Recipient', 'Type', 'Sent At', ''].map(col => (
                <th key={col} className="text-left text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] px-[18px] py-[13px] border-b border-[#ECE9F4] bg-[#FBFAFD]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[#8B8B9E] text-[13px] py-10">
                  No sent forms match your filters.
                </td>
              </tr>
            ) : filtered.map(f => (
              <tr key={f.id} className="hover:bg-[#FBFAFD] border-b border-[#ECE9F4] last:border-b-0">
                <td className="px-[18px] py-[14px] align-middle">
                  <span className="font-semibold text-[#1A1A2E]">{f.subject}</span>
                </td>
                <td className="px-[18px] py-[14px] align-middle text-[#4B4B63]">
                  {f.recipient}
                </td>
                <td className="px-[18px] py-[14px] align-middle">
                  <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full ${TYPE_COLORS[f.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {f.type}
                  </span>
                </td>
                <td className="px-[18px] py-[14px] align-middle text-[#8B8B9E] text-[12px] whitespace-nowrap">
                  {f.sentAt}
                </td>
                <td className="px-[18px] py-[14px] align-middle text-right">
                  <button
                    onClick={() => setSelected(f)}
                    className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer bg-none border-none hover:underline"
                  >
                    View detail →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <MailDetailPanel form={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
