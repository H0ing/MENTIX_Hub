import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../shared/Toast';
import { useAuth }  from '../../contexts/AuthContext';
import MailDetailPanel from './MailDetailPanel';
import * as settingsService from '../../services/settingsService';
import * as authService from '../../services/authService';

export default function TopBar() {
  const showToast = useToast();
  const navigate  = useNavigate();
  const { logout } = useAuth();
  const admin     = authService.getCurrentAdmin();
  const sentForms = settingsService.getSentForms();

  const [openDD, setOpenDD]   = useState(null); // 'mail' | 'profile'
  const [mailForm, setMailForm] = useState(null);

  function toggleDD(name) { setOpenDD(v => (v === name ? null : name)); }

  function openMail(form) {
    setOpenDD(null);
    setMailForm(form);
  }

  return (
    <>
      <div className="h-16 flex-shrink-0 flex items-center px-7 border-b border-[#ECE9F4] bg-white relative">

        {/* Right side — role badge, mail, profile */}
        <div className="ml-auto flex items-center gap-4">

          {/* Role badge */}
          <span className="text-[11px] font-bold tracking-[0.04em] bg-[#F0EAFC] text-[#7C3AED] px-3 py-[6px] rounded-full select-none">
            {admin.role.replace(/_/g, ' ').toUpperCase()}
          </span>

          {/* Mail / Sent forms */}
          <div className="relative">
            <button
              onClick={() => toggleDD('mail')}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#4B4B63] hover:bg-[#F7F5FF] transition-colors"
              aria-label="Forms sent to users"
            >
              <svg className="w-[19px] h-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 6.5l9 6.5 9-6.5"/>
              </svg>
            </button>

            {openDD === 'mail' && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDD(null)} />
                <div
                  className="fixed w-[360px] bg-white border border-[#ECE9F4] rounded-[14px] shadow-[0_18px_40px_rgba(30,20,60,0.2)] overflow-hidden z-[9999]"
                  style={{ top: 64, right: 56 }}
                >
                <div className="px-4 py-3.5 border-b border-[#ECE9F4]">
                  <h4 className="m-0 text-[14px] font-bold">Forms Sent to Users</h4>
                </div>
                <div className="max-h-[340px] overflow-y-auto">
                  {sentForms.map(f => (
                    <div key={f.id} className="px-4 py-[13px] border-b border-[#ECE9F4] last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold">{f.subject}</span>
                        <span className="text-[10px] font-bold bg-[#E9F9EF] text-[#16A34A] px-2 py-[3px] rounded-full">
                          Sent
                        </span>
                      </div>
                      <div className="text-[12px] text-[#8B8B9E]">To: {f.recipient}</div>
                      <div className="text-[11px] text-[#B7B2C9] mt-[3px]">
                        {f.sentAt} ·{' '}
                        <span onClick={() => openMail(f)} className="text-[#7C3AED] font-semibold cursor-pointer">
                          View detail
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={() => { navigate('/admin/sent-forms'); setOpenDD(null); }}
                  className="px-4 py-2.5 text-center text-[12.5px] font-semibold text-[#7C3AED] border-t border-[#ECE9F4] cursor-pointer hover:bg-[#F7F5FF] transition-colors"
                >
                  View all sent forms
                </div>
              </div>
              </>,
              document.body
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => toggleDD('profile')}
              className="flex items-center gap-2 px-1.5 py-1 rounded-[10px] hover:bg-[#F7F5FF] transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center text-[11px] font-bold select-none">
                {admin.initials}
              </div>
            </button>

            {openDD === 'profile' && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDD(null)} />
                <div
                  className="fixed w-[220px] bg-white border border-[#ECE9F4] rounded-[14px] shadow-[0_18px_40px_rgba(30,20,60,0.2)] overflow-hidden z-[9999]"
                  style={{ top: 64, right: 16 }}
                >
                {/* User info row */}
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#ECE9F4]">
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {admin.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">{admin.name}</div>
                    <div className="text-[11px] text-[#8B8B9E] capitalize">{admin.role.replace(/_/g, ' ')}</div>
                  </div>
                </div>

                <div
                  onClick={() => { setOpenDD(null); navigate('/admin/profile'); }}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] cursor-pointer hover:bg-[#F7F5FF] transition-colors"
                >
                  <svg className="w-[15px] h-[15px] text-[#8B8B9E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/>
                  </svg>
                  Profile
                </div>

                <div
                  onClick={() => { setOpenDD(null); logout(); }}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] cursor-pointer hover:bg-[#F7F5FF] transition-colors border-t border-[#ECE9F4]"
                >
                  <svg className="w-[15px] h-[15px] text-[#8B8B9E] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/>
                    <path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>
                  </svg>
                  Logout
                </div>
              </div>
              </>,
              document.body
            )}
          </div>

        </div>
      </div>

      {mailForm && <MailDetailPanel form={mailForm} onClose={() => setMailForm(null)} />}
    </>
  );
}
