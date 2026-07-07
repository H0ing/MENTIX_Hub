import { useState, useEffect, useCallback } from 'react';
import MailDetailPanel from '../../components/admin/MailDetailPanel';
import Loading from '../../components/shared/Loading';
import { getSentForms } from '../../services/settingsService';

// ── Colour map for form_type from backend ─────────────────────────────────────
const TYPE_COLORS = {
  report_resolution:    'bg-[#F0EAFC] text-[#7C3AED]',
  promotion_approved:   'bg-[#E9F9EF] text-[#16A34A]',
  promotion_rejected:   'bg-[#FEF3E2] text-[#B45309]',
  account_action:       'bg-[#FDEAF0] text-[#E0245E]',
  other:                'bg-[#F3F4F6] text-[#6B7280]',
};

const TYPE_LABELS = {
  report_resolution:  'Report Resolution',
  promotion_approved: 'Promotion Approved',
  promotion_rejected: 'Promotion Rejected',
  account_action:     'Account Action',
  other:              'Other',
};

// ── Date formatter: "26 Oct 2023, 10:14 (3 days ago)" ────────────────────────
function fmtSentAt(iso) {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ago  = diff === 0 ? 'today'
             : diff === 1 ? '1 day ago'
             : `${diff} days ago`;
  return { display: `${date}, ${time}`, ago };
}

export default function SentFormsPage() {
  const [forms, setForms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getSentForms();
      setForms(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load sent forms.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = forms.filter(f => {
    const matchType = typeFilter === 'all' || f.form_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || f.subject?.toLowerCase().includes(q)
      || f.recipient_username?.toLowerCase().includes(q)
      || f.recipient_email?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const types = ['all', ...new Set(forms.map(f => f.form_type).filter(Boolean))];

  // Adapt backend row → MailDetailPanel shape
  function toPanel(f) {
    return {
      id:        f.id,
      subject:   f.subject,
      recipient: f.recipient_username || f.recipient_email || '—',
      sentAt:    f.sent_at,
      body:      f.body,
      type:      TYPE_LABELS[f.form_type] ?? f.form_type,
      sentBy:    f.sent_by_username,
      timeline:  [],   // timeline not stored — shown as empty
    };
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Sent Forms</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">System-generated notices sent to users after admin actions.</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5 items-center flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#ECE9F4] rounded-[10px] px-3 py-[9px] flex-1 max-w-[340px]">
          <svg className="w-[14px] h-[14px] text-[#8B8B9E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject or recipient…"
            className="border-none bg-transparent outline-none text-[13px] w-full text-[#1A1A2E] placeholder:text-[#8B8B9E]" />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]">
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All types' : (TYPE_LABELS[t] ?? t)}</option>
          ))}
        </select>

        <span className="text-[12.5px] text-[#8B8B9E] ml-auto">
          {filtered.length} {filtered.length === 1 ? 'form' : 'forms'}
        </span>
      </div>

      {error && <p className="text-[#E0245E] text-[13px] mb-4">{error}</p>}

      {loading ? <Loading /> : (
        <div className="bg-white border border-[#ECE9F4] rounded-[14px] overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Subject', 'Recipient', 'Type', 'Sent', ''].map(col => (
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
                    No sent forms yet.
                  </td>
                </tr>
              ) : filtered.map(f => {
                const { display, ago } = fmtSentAt(f.sent_at);
                return (
                  <tr key={f.id} className="hover:bg-[#FBFAFD] border-b border-[#ECE9F4] last:border-b-0">
                    <td className="px-[18px] py-[14px] align-middle">
                      <span className="font-semibold text-[#1A1A2E]">{f.subject}</span>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle text-[#4B4B63]">
                      {f.recipient_username || f.recipient_email || '—'}
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full ${TYPE_COLORS[f.form_type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_LABELS[f.form_type] ?? f.form_type}
                      </span>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <div className="text-[12px] text-[#4B4B63] whitespace-nowrap">{display}</div>
                      <div className="text-[11px] text-[#B7B2C9]">{ago}</div>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle text-right">
                      <button onClick={() => setSelected(f)}
                        className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer bg-none border-none hover:underline">
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <MailDetailPanel form={toPanel(selected)} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
