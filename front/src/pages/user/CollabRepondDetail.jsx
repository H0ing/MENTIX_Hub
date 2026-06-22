import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { mockCollaborationRequests, getUserById } from '../../data/mockdata';

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

  const request = mockCollaborationRequests.find((r) => r.id === Number(id));

  if (!request) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg text-gray-400">Collaboration response not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const sender = getUserById(request.sender_id);
  const receiver = getUserById(request.receiver_id);
  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  const response = request.response_message ? JSON.parse(request.response_message) : null;

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      <div className="max-w-[900px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[14px] font-medium mb-6 hover:underline">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight">Collaboration Response</h1>
            <p className="text-[#4a4455] text-[16px] mt-1">
              {request.responded_at ? `Responded ${formatDate(request.responded_at)}` : 'Not yet responded'}
            </p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[13px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Original Request</p>
              <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${sender?.id}`)}>
                <div className="w-10 h-10 rounded-full bg-[#e45a5a] flex items-center justify-center shrink-0 overflow-hidden">
                  {sender?.avatar_url ? (
                    <img src={sender.avatar_url} alt={sender.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[14px]">
                      {sender?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[#191c1d] font-semibold text-[15px]">{sender?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">Sent {formatDate(request.created_at)}</p>
                </div>
              </div>

              <InfoBlock label="Interested In">
                <p className="text-[#191c1d] font-semibold text-[15px] mt-1">{request.project_interested}</p>
              </InfoBlock>

              <div className="mt-3">
                <InfoBlock label="Intro">
                  <p className="text-[#4a4455] text-[14px] italic leading-relaxed mt-1">{request.intro}</p>
                </InfoBlock>
              </div>

              <div className="mt-3 pt-3 border-t border-[rgba(204,195,216,0.3)]">
                <InfoBlock label="From">
                  <p className="text-[#4a4455] text-[14px] mt-1">
                    {sender?.full_name || 'Unknown'} → {receiver?.full_name || 'Unknown'}
                  </p>
                </InfoBlock>
              </div>
            </div>

            {!response && request.status === 'pending' && (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 text-center">
                <FiClock size={24} className="text-[#2b1bff] mx-auto mb-2" />
                <p className="text-[#4a4455] text-[15px]">Waiting for a response...</p>
              </div>
            )}

            {!response && request.status === 'rejected' && (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 text-center">
                <FiXCircle size={24} className="text-[#f30000] mx-auto mb-2" />
                <p className="text-[#4a4455] text-[15px]">This request was declined.</p>
              </div>
            )}
          </div>

          <div className="col-span-3 flex flex-col gap-5">
            {response ? (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(204,195,216,0.3)]">
                  <FiMessageSquare size={20} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider">Response</span>
                  <span className="text-[11px] text-gray-400 ml-auto">{formatDate(request.responded_at)}</span>
                </div>

                <InfoBlock label="Reply Message">
                  <div className="bg-[#f6f5f5] rounded-[8px] px-4 py-3 mt-1">
                    <p className="text-[#4a4455] text-[15px] italic leading-relaxed">{response.message}</p>
                  </div>
                </InfoBlock>

                {response.suggested_next_steps && (
                  <InfoBlock label="Suggested Next Steps">
                    <div className="flex items-start gap-2 mt-1">
                      <FiCalendar size={16} className="text-[#630ed4] shrink-0 mt-0.5" />
                      <p className="text-[#4a4455] text-[15px] leading-relaxed">{response.suggested_next_steps}</p>
                    </div>
                  </InfoBlock>
                )}

                {response.availability && (
                  <InfoBlock label="Availability">
                    <div className="flex items-start gap-2 mt-1">
                      <FiClock size={16} className="text-[#630ed4] shrink-0 mt-0.5" />
                      <p className="text-[#4a4455] text-[15px] leading-relaxed">{response.availability}</p>
                    </div>
                  </InfoBlock>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(204,195,216,0.3)]">
                  <FiMessageSquare size={20} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider">Response</span>
                </div>
                <p className="text-[#4a4455] text-[15px] italic text-center py-6">No response yet.</p>
              </div>
            )}

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-3">Responder</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${receiver?.id}`)}>
                <div className="w-12 h-12 rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden">
                  {receiver?.avatar_url ? (
                    <img src={receiver.avatar_url} alt={receiver.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[16px]">
                      {receiver?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{receiver?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{receiver?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
