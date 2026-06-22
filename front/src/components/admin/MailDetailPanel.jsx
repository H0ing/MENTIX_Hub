import { useState } from 'react';
import { useToast } from '../shared/Toast';
import StatusTag from '../shared/StatusTag';
import { can } from '../../services/authService';
import { getMailReplies } from '../../services/settingsService';

// Tab definitions — 'allmail' is role-gated
const TAB_DEFS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'message',   label: 'Message Body' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'allmail',   label: 'All Mail', restricted: true },
];

export default function MailDetailPanel({ form, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const showToast   = useToast();
  const canAllMail  = can('tab_allmail');
  const replies     = getMailReplies(form?.id);

  if (!form) return null;

  function copyBody() {
    navigator.clipboard?.writeText(form.body);
    showToast('Message copied to clipboard');
  }

  function handleTabClick(tab) {
    if (tab.restricted && !canAllMail) return; // locked — do nothing
    setActiveTab(tab.id);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[189]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 w-[480px] max-w-[94vw] h-screen bg-white border-l border-[#ECE9F4] shadow-[-12px_0_40px_rgba(30,20,60,0.13)] z-[190] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-[#ECE9F4] flex-shrink-0">
          <h3 className="m-0 text-[16px] font-bold truncate">{form.subject}</h3>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[#8B8B9E] text-xl hover:bg-[#F7F5FF] cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#ECE9F4] flex-shrink-0">
          {TAB_DEFS.map(tab => {
            const locked   = tab.restricted && !canAllMail;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                title={locked ? 'Access restricted — Super Admin and Moderator only' : undefined}
                className={`
                  relative px-5 py-[11px] text-[13px] font-semibold border-b-2 -mb-px transition-colors
                  ${isActive  ? 'text-[#7C3AED] border-[#7C3AED]' : 'border-transparent'}
                  ${locked    ? 'text-[#C4BFDA] cursor-not-allowed' : 'text-[#8B8B9E] hover:text-[#1A1A2E] cursor-pointer'}
                `}
              >
                {tab.label}
                {/* Lock icon for restricted tab */}
                {locked && (
                  <svg className="inline-block ml-1 mb-[2px] w-[11px] h-[11px] text-[#C4BFDA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )}
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
                  ['Recipient', form.recipient],
                  ['Sent At',   form.sentAt],
                  ['Status',    <StatusTag key="s" status="resolved" />],
                  ['Type',      form.type],
                  ['Sent By',   'Alex Rivera (Super Admin)'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2.5 py-[7px] border-b border-[#ECE9F4] last:border-b-0">
                    <span className="text-[#8B8B9E] text-[12px] font-bold uppercase tracking-[0.04em]">{k}</span>
                    <span className="text-[13px] font-semibold text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Preview</div>
              <div className="bg-[#F7F5FB] border border-[#ECE9F4] rounded-[10px] px-[18px] py-4 text-[13px] text-[#8B8B9E] italic leading-[1.65]">
                {form.body.length > 120 ? form.body.slice(0, 120) + '…' : form.body}
              </div>
            </>
          )}

          {/* ── Message Body ── */}
          {activeTab === 'message' && (
            <>
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Full Message</div>
              <div className="bg-[#F7F5FB] border border-[#ECE9F4] rounded-[10px] px-[18px] py-4 text-[13.5px] leading-[1.65] text-[#1A1A2E]">
                {form.body}
              </div>
              <button
                onClick={copyBody}
                className="mt-3.5 px-4 py-2 border border-[#ECE9F4] rounded-[10px] text-[12.5px] font-semibold bg-white hover:bg-[#F7F5FF] cursor-pointer"
              >
                Copy Text
              </button>
            </>
          )}

          {/* ── Timeline ── */}
          {activeTab === 'timeline' && (
            <>
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Activity Log</div>
              <div className="flex flex-col">
                {form.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3.5 py-3 border-b border-[#ECE9F4] last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-[5px] flex-shrink-0
                      ${item.dot === 'green' ? 'bg-[#16A34A]' : item.dot === 'amber' ? 'bg-[#B45309]' : 'bg-[#7C3AED]'}`}
                    />
                    <div>
                      <div className="text-[13px] font-semibold mb-0.5">{item.title}</div>
                      <div className="text-[11.5px] text-[#8B8B9E]">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── All Mail (role-gated) ── */}
          {activeTab === 'allmail' && canAllMail && (
            <>
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-3">
                Full Thread — {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </div>

              {/* Original message */}
              <MailBubble
                from="System (Admin Console)"
                sentAt={form.sentAt}
                body={form.body}
                isAdmin
              />

              {/* Replies */}
              {replies.length === 0 ? (
                <p className="text-[13px] text-[#8B8B9E] mt-4 text-center">No replies yet.</p>
              ) : (
                replies.map(r => (
                  <MailBubble
                    key={r.id}
                    from={r.fromLabel}
                    sentAt={r.sentAt}
                    body={r.body}
                    isAdmin={r.from.endsWith('@mentix.dev') && !r.from.includes('liam') && !r.from.includes('marcus') && !r.from.includes('elena') && !r.from.includes('sarah.chen')}
                  />
                ))
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

// ── Sub-component: single mail bubble ────────────────────────────────────────
function MailBubble({ from, sentAt, body, isAdmin }) {
  return (
    <div className={`mb-3 rounded-[10px] border px-[18px] py-4 ${isAdmin ? 'bg-[#F7F5FF] border-[#E0D9F9]' : 'bg-white border-[#ECE9F4]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[12.5px] font-bold ${isAdmin ? 'text-[#7C3AED]' : 'text-[#1A1A2E]'}`}>{from}</span>
        <span className="text-[11px] text-[#B7B2C9]">{sentAt}</span>
      </div>
      <p className="m-0 text-[13.5px] leading-[1.65] text-[#1A1A2E]">{body}</p>
    </div>
  );
}
