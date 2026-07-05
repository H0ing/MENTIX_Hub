import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { getCollaborationRequestById } from '../../api/collaborationApi';

const STATUS_STYLES = {
  accepted: { bg: 'bg-[#008321]', icon: <FiCheckCircle size={14} />, label: 'Accepted' },
  pending: { bg: 'bg-[#2b1bff]', icon: <FiClock size={14} />, label: 'Pending' },
  rejected: { bg: 'bg-[#f30000]', icon: <FiXCircle size={14} />, label: 'Rejected' },
};

function InfoBlock({ label, children }) {
  return (
    <div>
      <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

export default function CollabRepondDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollaborationRequestById(id)
      .then(({ data }) => setRequest(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Collaboration response not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  let response = null;
  try {
    response = request.response_message ? JSON.parse(request.response_message) : null;
  } catch {
    response = request.response_message;
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[900px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Collaboration Response</h1>
            <p className="text-[#4a4455] text-[14px] mt-0.5">
              {request.responded_at ? `Responded ${formatDate(request.responded_at)}` : 'Not yet responded'}
            </p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Original Request</p>
              <div className="flex items-center gap-2.5 mb-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[6px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${request.sender_id}`)}>
                <div className="w-9 h-9 rounded-full bg-[#e45a5a] flex items-center justify-center shrink-0 overflow-hidden">
                  {request.sender_avatar ? (
                    <img src={request.sender_avatar} alt={request.sender_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[13px]">
                      {request.sender_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{request.sender_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[10px]">Sent {formatDate(request.created_at)}</p>
                </div>
              </div>

              <InfoBlock label="Interested In">
                <p className="text-[#191c1d] font-semibold text-[14px] mt-0.5">{request.project_interest}</p>
              </InfoBlock>

              <div className="mt-2.5">
                <InfoBlock label="Intro">
                  <p className="text-[#4a4455] text-[13px] italic leading-relaxed mt-0.5">{request.benefit?.split('\n')[0]?.replace(/^Intro: /, '') || request.benefit}</p>
                </InfoBlock>
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-[rgba(204,195,216,0.3)]">
                <InfoBlock label="From">
                  <p className="text-[#4a4455] text-[13px] mt-0.5">
                    {request.sender_name || 'Unknown'} → {request.receiver_name || 'Unknown'}
                  </p>
                </InfoBlock>
              </div>
            </div>

            {!response && request.status === 'pending' && (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 text-center">
                <FiClock size={20} className="text-[#2b1bff] mx-auto mb-2" />
                <p className="text-[#4a4455] text-[14px]">Waiting for a response...</p>
              </div>
            )}

            {!response && request.status === 'rejected' && (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 text-center">
                <FiXCircle size={20} className="text-[#f30000] mx-auto mb-2" />
                <p className="text-[#4a4455] text-[14px]">This request was declined.</p>
              </div>
            )}
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            {response ? (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                  <FiMessageSquare size={16} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Response</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{formatDate(request.responded_at)}</span>
                </div>

                <InfoBlock label="Reply Message">
                  <div className="bg-[#f6f5f5] rounded-[6px] px-3 py-2.5 mt-0.5">
                    <p className="text-[#4a4455] text-[14px] italic leading-relaxed">{response.reply_message || response.message}</p>
                  </div>
                </InfoBlock>

                {response.contact_platform && (
                  <InfoBlock label="Contact Platform">
                    <p className="text-[#4a4455] text-[14px]">{response.contact_platform}: {response.contact_info}</p>
                  </InfoBlock>
                )}

                {response.first_step && (
                  <InfoBlock label="Suggested First Step">
                    <div className="flex items-start gap-1.5 mt-0.5">
                      <FiCalendar size={14} className="text-[#630ed4] shrink-0 mt-0.5" />
                      <p className="text-[#4a4455] text-[14px] leading-relaxed">{response.first_step}</p>
                    </div>
                  </InfoBlock>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                  <FiMessageSquare size={16} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Response</span>
                </div>
                <p className="text-[#4a4455] text-[14px] italic text-center py-5">No response yet.</p>
              </div>
            )}

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-2.5">Responder</p>
              <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f6f5f5] rounded-[6px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${request.receiver_id}`)}>
                <div className="w-10 h-10 rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden">
                  {request.receiver_avatar ? (
                    <img src={request.receiver_avatar} alt={request.receiver_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[14px]">
                      {request.receiver_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{request.receiver_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">@{request.receiver_username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
