import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiMail } from 'react-icons/fi';
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

function UserAvatar({ user, size = 'w-12 h-12' }) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return (
    <div className={`${size} rounded-full bg-[#e45a5a] flex items-center justify-center shrink-0 overflow-hidden`}>
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-[16px]">{initials}</span>
      )}
    </div>
  );
}

export default function CollabRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const request = mockCollaborationRequests.find((r) => r.id === Number(id));

  if (!request) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg text-gray-400">Collaboration request not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const sender = getUserById(request.sender_id);
  const receiver = getUserById(request.receiver_id);
  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  const skills = request.skills ? JSON.parse(request.skills) : [];

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[14px] font-medium mb-6 hover:underline">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight">Collaboration Request</h1>
            <p className="text-[#4a4455] text-[16px] mt-1">Sent {formatDate(request.created_at)}</p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[13px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[rgba(204,195,216,0.3)]">
                <FiMail size={20} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider">Request Details</span>
              </div>

              <InfoBlock label="Intro Message">
                <p className="text-[#4a4455] text-[15px] italic leading-relaxed bg-[#f6f5f5] rounded-[8px] px-4 py-3">{request.intro}</p>
              </InfoBlock>

              <InfoBlock label="Project Interested In">
                <p className="text-[#191c1d] font-semibold text-[16px]">{request.project_interested}</p>
              </InfoBlock>

              <div className="border-t border-[rgba(204,195,216,0.3)] pt-4">
                <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-3">Sender's Own Project</p>
                <InfoBlock label="Project Name">
                  <p className="text-[#191c1d] font-semibold text-[16px]">{request.own_project_name}</p>
                </InfoBlock>
                <div className="mt-3">
                  <InfoBlock label="Description">
                    <p className="text-[#4a4455] text-[15px] leading-relaxed">{request.own_project_desc}</p>
                  </InfoBlock>
                </div>
              </div>

              <InfoBlock label="Why They Want to Collaborate">
                <p className="text-[#4a4455] text-[15px] leading-relaxed bg-[#f6f5f5] rounded-[8px] px-4 py-3">{request.why_collaborate}</p>
              </InfoBlock>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Sender</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${sender?.id}`)}>
                <UserAvatar user={sender} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{sender?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{sender?.role || 'User'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Receiver</p>
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

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5 flex flex-col gap-4">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider">Skills Offered</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="bg-[#d8e2ff] text-[#001a42] text-[12px] font-semibold px-3 py-1 rounded-full">{skill}</span>
                ))}
              </div>
              {request.other_skill && (
                <div>
                  <p className="text-[11px] text-[#7b7487] mb-1">Other Skills</p>
                  <p className="text-[#4a4455] text-[14px]">{request.other_skill}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-2">Preferred Connect</p>
              <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[12px] px-3 py-1 rounded-full">{request.preferred_connect}</span>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5 flex flex-col gap-2">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider">Timeline</p>
              <p className="text-[11px] text-[#7b7487]">Sent</p>
              <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(request.created_at)}</p>
              {request.responded_at && (
                <>
                  <p className="text-[11px] text-[#7b7487] mt-2">Responded</p>
                  <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(request.responded_at)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
