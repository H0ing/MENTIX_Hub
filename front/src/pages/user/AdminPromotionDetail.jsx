import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiUserCheck } from 'react-icons/fi';
import { getMyNotifications } from '../../api/notificationApi';

function InfoBlock({ label, children }) {
  return (
    <div>
      <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

export default function AdminPromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const cached = location.state?.notice;
  const hasCached = cached && String(cached.id) === String(id);

  const [notice, setNotice] = useState(hasCached ? cached : null);
  const [loading, setLoading] = useState(!hasCached);

  useEffect(() => {
    if (hasCached) return;

    getMyNotifications()
      .then(({ data }) => {
        const items = data?.data || data || [];
        const found = items.find((n) => String(n.id) === String(id));
        if (found) setNotice(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, hasCached]);

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  const typeMeta = {
    promotion_approved: {
      badge: 'bg-[#16A34A]',
      icon: <FiCheckCircle size={14} />,
      label: 'Approved',
      accent: 'text-[#16A34A]',
    },
    promotion_rejected: {
      badge: 'bg-[#B45309]',
      icon: <FiXCircle size={14} />,
      label: 'Rejected',
      accent: 'text-[#B45309]',
    },
  };

  if (loading) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Notice not found.</p>
          <button onClick={() => navigate('/inbox')} className="mt-4 text-[#630ed4] hover:underline">Back to Inbox</button>
        </div>
      </div>
    );
  }

  const meta = typeMeta[notice.form_type] || {
    badge: 'bg-gray-500',
    icon: <FiUserCheck size={14} />,
    label: notice.form_type?.replace(/_/g, ' '),
    accent: 'text-gray-600',
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#630ed4] flex items-center justify-center shrink-0">
              <FiUserCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Mentor Promotion</h1>
              <p className="text-[#4a4455] text-[14px] mt-0.5">Sent {formatDate(notice.sent_at)}</p>
            </div>
          </div>
          <span className={`${meta.badge} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
            {meta.icon} {meta.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                <FiUserCheck size={16} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Notice Details</span>
              </div>

              <InfoBlock label="Subject">
                <p className="text-[#191c1d] font-semibold text-[15px]">{notice.subject}</p>
              </InfoBlock>

              <InfoBlock label="Message">
                <p className="text-[#4a4455] text-[14px] leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5 whitespace-pre-wrap">{notice.body}</p>
              </InfoBlock>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-1.5">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Details</p>

              <div>
                <p className="text-[10px] text-[#7b7487]">Status</p>
                <p className={`text-[13px] font-semibold ${meta.accent}`}>
                  {meta.icon} {meta.label}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#7b7487]">Sent</p>
                <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(notice.sent_at)}</p>
              </div>

              {notice.related_entity_id && (
                <div>
                  <p className="text-[10px] text-[#7b7487]">Reference ID</p>
                  <p className="text-[#191c1d] text-[13px] font-medium">#{notice.related_entity_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
