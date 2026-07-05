import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiBookOpen } from 'react-icons/fi';
import { getMentorshipRequestById } from '../../api/mentorshipApi';

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
    <div className={`${size} rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-[14px]">{initials}</span>
      )}
    </div>
  );
}

function parseContext(context) {
  if (!context) return { title: '', stage: '' };
  const lines = context.split('\n');
  const title = lines[0]?.replace(/^Title: /, '') || '';
  const stage = lines[2]?.replace(/^Stage: /, '') || '';
  return { title, stage };
}

export default function MentorRespondDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMentorshipRequestById(id)
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
          <p className="text-base text-gray-400">Mentorship response not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  let response = null;
  try {
    response = request.mentor_response ? JSON.parse(request.mentor_response) : null;
  } catch {
    response = request.mentor_response;
  }

  const project = parseContext(request.project_context);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Mentorship Response</h1>
            <p className="text-[#4a4455] text-[14px] mt-0.5">
              {request.responded_at ? `Responded ${formatDate(request.responded_at)}` : 'Not yet responded'}
            </p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 flex flex-col gap-4">
            {response ? (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                  <FiBookOpen size={16} className="text-[#630ed4]" />
                  <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Guidance Provided</span>
                </div>

                <InfoBlock label="Overall Take">
                  <p className="text-[#4a4455] text-[14px] leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{response.overall_take}</p>
                </InfoBlock>

                <InfoBlock label="Things to Consider">
                  <p className="text-[#4a4455] text-[14px] leading-relaxed">{response.things_to_consider}</p>
                </InfoBlock>

                <InfoBlock label="Suggested Approach">
                  <p className="text-[#4a4455] text-[14px] leading-relaxed">{response.suggested_approach}</p>
                </InfoBlock>

                {response.resources && (
                  <InfoBlock label="Resources & References">
                    <p className="text-[#4a4455] text-[14px] leading-relaxed">{response.resources}</p>
                  </InfoBlock>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 text-center">
                {request.status === 'pending' ? (
                  <>
                    <FiClock size={20} className="text-[#2b1bff] mx-auto mb-2" />
                    <p className="text-[#4a4455] text-[14px]">No response yet.</p>
                  </>
                ) : (
                  <>
                    <FiXCircle size={20} className="text-[#f30000] mx-auto mb-2" />
                    <p className="text-[#4a4455] text-[14px]">This request was declined.</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Mentor</p>
              <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f6f5f5] rounded-[6px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${request.mentor_id}`)}>
                <UserAvatar fullName={request.mentor_name} avatarUrl={request.mentor_avatar} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{request.mentor_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">@{request.mentor_username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Student</p>
              <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f6f5f5] rounded-[6px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${request.student_id}`)}>
                <UserAvatar fullName={request.student_name} avatarUrl={request.student_avatar} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{request.student_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">@{request.student_username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-2.5">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Original Request</p>
              <InfoBlock label="Project">
                <p className="text-[#191c1d] font-semibold text-[14px] mt-0.5">{project.title}</p>
              </InfoBlock>
              <p className="text-[#4a4455] text-[14px] leading-relaxed">{request.project_context}</p>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-2">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Timeline</p>
              <div>
                <p className="text-[11px] text-[#7b7487]">Request Sent</p>
                <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(request.created_at)}</p>
              </div>
              {request.responded_at && (
                <div>
                  <p className="text-[11px] text-[#7b7487]">Responded</p>
                  <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(request.responded_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
