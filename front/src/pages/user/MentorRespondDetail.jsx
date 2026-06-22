import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiBookOpen } from 'react-icons/fi';
import { mockMentorshipRequests, getUserById } from '../../data/mockdata';

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
    <div className={`${size} rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden`}>
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-[16px]">{initials}</span>
      )}
    </div>
  );
}

export default function MentorRespondDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const request = mockMentorshipRequests.find((r) => r.id === Number(id));

  if (!request) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg text-gray-400">Mentorship response not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const student = getUserById(request.student_id);
  const mentor = getUserById(request.mentor_id);
  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  const response = request.mentor_response ? JSON.parse(request.mentor_response) : null;

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
            <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight">Mentorship Response</h1>
            <p className="text-[#4a4455] text-[16px] mt-1">
              {request.responded_at ? `Responded ${formatDate(request.responded_at)}` : 'Not yet responded'}
            </p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[13px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex flex-col gap-5">
            {response ? (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(204,195,216,0.3)]">
                  <FiBookOpen size={20} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider">Guidance Provided</span>
                </div>

                <InfoBlock label="Overall Take">
                  <p className="text-[#4a4455] text-[15px] leading-relaxed bg-[#f6f5f5] rounded-[8px] px-4 py-3">{response.overallTake}</p>
                </InfoBlock>

                <InfoBlock label="Things to Consider">
                  <p className="text-[#4a4455] text-[15px] leading-relaxed">{response.thingsToConsider}</p>
                </InfoBlock>

                <InfoBlock label="Suggested Approach">
                  <p className="text-[#4a4455] text-[15px] leading-relaxed">{response.suggestedApproach}</p>
                </InfoBlock>

                {response.resources && (
                  <InfoBlock label="Resources & References">
                    <p className="text-[#4a4455] text-[15px] leading-relaxed">{response.resources}</p>
                  </InfoBlock>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 text-center">
                {request.status === 'pending' ? (
                  <>
                    <FiClock size={24} className="text-[#2b1bff] mx-auto mb-2" />
                    <p className="text-[#4a4455] text-[15px]">No response yet.</p>
                  </>
                ) : (
                  <>
                    <FiXCircle size={24} className="text-[#f30000] mx-auto mb-2" />
                    <p className="text-[#4a4455] text-[15px]">This request was declined.</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Mentor</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${mentor?.id}`)}>
                <UserAvatar user={mentor} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{mentor?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{mentor?.role || 'Mentor'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Student</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${student?.id}`)}>
                <UserAvatar user={student} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{student?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{student?.role || 'Student'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5 flex flex-col gap-3">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider">Original Request</p>
              <InfoBlock label="Project">
                <p className="text-[#191c1d] font-semibold text-[15px] mt-1">{request.project_title}</p>
              </InfoBlock>
              <div className="flex gap-3">
                <span className="bg-[#4edea3] text-[#005236] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{request.project_stage}</span>
                <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{request.guidance_type}</span>
              </div>
              <p className="text-[#4a4455] text-[13px] leading-relaxed line-clamp-2 mt-1">{request.project_context}</p>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5 flex flex-col gap-2">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider">Timeline</p>
              <div>
                <p className="text-[11px] text-[#7b7487]">Request Sent</p>
                <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(request.created_at)}</p>
              </div>
              {request.responded_at && (
                <div>
                  <p className="text-[11px] text-[#7b7487]">Responded</p>
                  <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(request.responded_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
