import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiMail } from 'react-icons/fi';
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

function UserAvatar({ fullName, avatarUrl, size = 'w-10 h-10' }) {
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return (
    <div className={`${size} rounded-full bg-[#e45a5a] flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-[14px]">{initials}</span>
      )}
    </div>
  );
}

function parseBenefit(benefit) {
  if (!benefit) return { intro: '', myProject: '', skills: '' };
  const intro = benefit.split('\n')[0]?.replace(/^Intro: /, '') || '';
  const myProject = benefit.split('\n')[1]?.replace(/^My project: /, '') || '';
  const skills = benefit.split('\n')[2]?.replace(/^Skills: /, '') || '';
  return { intro, myProject, skills };
}

export default function CollabRequestDetail() {
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
          <p className="text-base text-gray-400">Collaboration request not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  const parsed = parseBenefit(request.benefit);
  const skills = parsed.skills ? parsed.skills.split(', ') : [];

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Collaboration Request</h1>
            <p className="text-[#4a4455] text-[14px] mt-0.5">Sent {formatDate(request.created_at)}</p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                <FiMail size={16} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Request Details</span>
              </div>

              <InfoBlock label="Intro Message">
                <p className="text-[#4a4455] text-[14px] italic leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{parsed.intro}</p>
              </InfoBlock>

              <InfoBlock label="Project Interested In">
                <p className="text-[#191c1d] font-semibold text-[14px]">{request.project_interest}</p>
              </InfoBlock>

              <div className="border-t border-[rgba(204,195,216,0.3)] pt-3.5">
                <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-2.5">Sender's Own Project</p>
                <InfoBlock label="Project Info">
                  <p className="text-[#191c1d] text-[14px]">{parsed.myProject}</p>
                </InfoBlock>
              </div>

              <InfoBlock label="Why They Want to Collaborate">
                <p className="text-[#4a4455] text-[14px] leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{request.why_needed}</p>
              </InfoBlock>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Sender</p>
              <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f6f5f5] rounded-[6px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${request.sender_id}`)}>
                <UserAvatar fullName={request.sender_name} avatarUrl={request.sender_avatar} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{request.sender_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">@{request.sender_username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Receiver</p>
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

            {skills.length > 0 && (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-3">
                <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Skills Offered</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-[#d8e2ff] text-[#001a42] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-1.5">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Timeline</p>
              <p className="text-[10px] text-[#7b7487]">Sent</p>
              <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(request.created_at)}</p>
              {request.responded_at && (
                <>
                  <p className="text-[10px] text-[#7b7487] mt-1.5">Responded</p>
                  <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(request.responded_at)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
