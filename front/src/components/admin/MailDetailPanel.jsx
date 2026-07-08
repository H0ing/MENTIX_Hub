import { useState } from 'react';
import { useToast } from '../shared/Toast';

// ── Format ISO date ───────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ago  = diff === 0 ? 'today' : diff === 1 ? '1 day ago' : `${diff} days ago`;
  return `${date}, ${time} (${ago})`;
}

// ── Tabs — only Overview and Full Message ─────────────────────────────────────
const TAB_DEFS = [
  { id: 'overview', label: 'Overview' },
  { id: 'message',  label: 'Full Message' },
];

export default function MailDetailPanel({ form, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const showToast  = useToast();

  if (!form) return null;

  function copyBody() {
    navigator.clipboard?.writeText(form.body);
    showToast('Message copied to clipboard');
  }

  function handleTabClick(tab) {
    setActiveTab(tab.id);
  }

  // Normalise field names — form can come from mock or backend
  const sentAt   = form.sent_at || form.sentAt;
  const sentBy   = form.sentBy || form.sent_by_username || 'System';
  const recipient = form.recipient || form.recipient_username || form.recipient_email || '—';

  return (
    <>
      <div className="fixed inset-0 z-[189]" onClick={onClose} />
      <div className="fixed top-0 right-0 w-[480px] max-w-[94vw] h-screen bg-white border-l border-[#ECE9F4] shadow-[-12px_0_40px_rgba(30,20,60,0.13)] z-[190] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#ECE9F4] flex-shrink-0">
          <h3 className="m-0 text-[16px] font-bold truncate pr-3">{form.subject}</h3>
          <button onClick={onClose}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[#8B8B9E] text-xl hover:bg-[#F7F5FF] flex-shrink-0">
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#ECE9F4] flex-shrink-0">
          {TAB_DEFS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabClick(tab)}
                className={`
                  relative px-5 py-[11px] text-[13px] font-semibold border-b-2 -mb-px transition-colors
                  ${isActive ? 'text-[#7C3AED] border-[#7C3AED]' : 'border-transparent'}
                  text-[#8B8B9E] hover:text-[#1A1A2E] cursor-pointer
                `}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[22px]">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <>
              <div className="flex flex-col bg-[#F7F5FF] rounded-[10px] px-[18px] py-4 mb-[18px]">
                {[
                  ['Subject',   form.subject],
                  ['Recipient', recipient],
                  ['Sent',      fmtDate(sentAt)],
                  ['Type',      form.type],
                  ['Sent by',   sentBy],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2.5 py-[7px] border-b border-[#ECE9F4] last:border-b-0">
                    <span className="text-[#8B8B9E] text-[12px] font-bold uppercase tracking-[0.04em] flex-shrink-0">{k}</span>
                    <span className="text-[13px] font-semibold text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Preview</div>
              <div className="bg-[#F7F5FB] border border-[#ECE9F4] rounded-[10px] px-[18px] py-4 text-[13px] text-[#8B8B9E] italic leading-[1.65]">
                {form.body?.slice(0, 160)}{form.body?.length > 160 ? '…' : ''}
              </div>
            </>
          )}

          {/* ── Full Message ── */}
          {activeTab === 'message' && (
            <>
              <div className="bg-[#F7F5FB] border border-[#ECE9F4] rounded-[10px] px-[18px] py-4 text-[13.5px] leading-[1.65] text-[#1A1A2E] whitespace-pre-wrap">
                {form.body}
              </div>
              <button onClick={copyBody}
                className="mt-3.5 px-4 py-2 border border-[#ECE9F4] rounded-[10px] text-[12.5px] font-semibold bg-white hover:bg-[#F7F5FF] cursor-pointer">
                Copy Text
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

