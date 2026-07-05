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

function UserAvatar({ fullName, avatarUrl, size = 'w-12 h-12' }) {
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return (
    <div className={`${size} rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-[16px]">{initials}</span>
      )}
    </div>
  );
}

function parseContext(context) {
  if (!context) return { title: '', about: '', stage: '' };
  const lines = context.split('\n');
  const title = lines[0]?.replace(/^Title: /, '') || '';
  const about = lines[1]?.replace(/^About: /, '') || '';
  const stage = lines[2]?.replace(/^Stage: /, '') || '';
  return { title, about, stage };
}

function parseHelpNeeded(help) {
  if (!help) return { guidance: '', efforts: '', type: '' };
  const lines = help.split('\n');
  const guidance = lines[0]?.replace(/^Guidance needed: /, '') || '';
  const efforts = lines[1]?.replace(/^Already tried: /, '') || '';
  const type = lines[2]?.replace(/^Guidance type: /, '') || '';
  return { guidance, efforts, type };
}

export default function MentorRequestDetail() {
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
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Mentorship request not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
  const project = parseContext(request.project_context);
  const help = parseHelpNeeded(request.help_needed);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Mentorship Request</h1>
            <p className="text-[#4a4455] text-[14px] mt-0.5">Submitted {formatDate(request.created_at)}</p>
          </div>
          <span className={`${statusStyle.bg} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                <FiBookOpen size={16} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Project Information</span>
              </div>

              <InfoBlock label="Project Title">
                <p className="text-[#191c1d] font-semibold text-[15px]">{project.title}</p>
              </InfoBlock>

              <InfoBlock label="Project Context">
                <p className="text-[#4a4455] text-[14px] leading-relaxed">{project.about}</p>
              </InfoBlock>

              <div className="flex gap-5">
                {project.stage && (
                  <InfoBlock label="Stage">
                    <span className="bg-[#4edea3] text-[#005236] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{project.stage}</span>
                  </InfoBlock>
                )}
                {help.type && (
                  <InfoBlock label="Guidance Type">
                    <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{help.type}</span>
                  </InfoBlock>
                )}
              </div>

              <InfoBlock label="Needs Guidance On">
                <p className="text-[#4a4455] text-[14px] italic leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{help.guidance}</p>
              </InfoBlock>

              <InfoBlock label="Previous Efforts">
                <p className="text-[#4a4455] text-[14px] leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{help.efforts}</p>
              </InfoBlock>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
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

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-2.5">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Timeline</p>
              <div>
                <p className="text-[11px] text-[#7b7487]">Sent</p>
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
