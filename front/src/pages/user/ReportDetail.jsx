import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiFlag, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { mockReports, getProjectById, getUserById } from '../../data/mockdata';

const STATUS_STYLES = {
  resolved: { bg: 'bg-[#008321]', icon: <FiCheckCircle size={14} />, label: 'Resolved' },
  under_review: { bg: 'bg-amber-500', icon: <FiClock size={14} />, label: 'Under Review' },
  pending: { bg: 'bg-[#2b1bff]', icon: <FiAlertTriangle size={14} />, label: 'Pending' },
};

const PRIORITY_COLORS = {
  Low: 'bg-gray-200 text-gray-700',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
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

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const report = mockReports.find((r) => r.id === Number(id));

  if (!report) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg text-gray-400">Report not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const project = getProjectById(report.project_id);
  const reporter = getUserById(report.reported_by);
  const projectOwner = getUserById(report.project_owner_id);
  const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
  const priorityStyle = PRIORITY_COLORS[report.priority] || PRIORITY_COLORS.Medium;

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  let reviewNotes = null;
  try {
    reviewNotes = report.review_notes ? JSON.parse(report.review_notes) : null;
  } catch {
    reviewNotes = report.review_notes;
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[14px] font-medium mb-6 hover:underline">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight">Report Detail</h1>
              <p className="text-[#4a4455] text-[16px] mt-1">Filed {formatDate(report.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${priorityStyle} text-[11px] font-bold uppercase px-3 py-1 rounded-full`}>
              {report.priority}
            </span>
            <span className={`${statusStyle.bg} text-white text-[13px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5`}>
              {statusStyle.icon} {statusStyle.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[rgba(204,195,216,0.3)]">
                <FiFlag size={20} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider">Report Details</span>
              </div>

              <InfoBlock label="Project">
                <p className="text-[#191c1d] font-semibold text-[18px]">{project?.title || 'Unknown Project'}</p>
                {project?.description && (
                  <p className="text-[#4a4455] text-[13px] mt-0.5 line-clamp-2">{project.description}</p>
                )}
              </InfoBlock>

              <InfoBlock label="Problem">
                <p className="text-[#4a4455] text-[15px] leading-relaxed bg-[#f6f5f5] rounded-[8px] px-4 py-3">{report.problem}</p>
              </InfoBlock>

              <InfoBlock label="Reason">
                <p className="text-[#4a4455] text-[15px] italic leading-relaxed">{report.reason}</p>
              </InfoBlock>
            </div>

            {reviewNotes && (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6">
                <InfoBlock label="Review Notes">
                  <p className="text-[#4a4455] text-[15px] leading-relaxed">
                    {typeof reviewNotes === 'object' ? JSON.stringify(reviewNotes, null, 2) : reviewNotes}
                  </p>
                </InfoBlock>
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Reported by</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${reporter?.id}`)}>
                <UserAvatar user={reporter} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{reporter?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{reporter?.role || 'User'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-4">Project Owner</p>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#f6f5f5] rounded-[8px] p-1 -m-1 transition-colors" onClick={() => navigate(`/profile/${projectOwner?.id}`)}>
                <UserAvatar user={projectOwner} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[16px]">{projectOwner?.full_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[12px]">{projectOwner?.role || 'User'}</p>
                </div>
              </div>
            </div>

            {report.assigned_to && (
              <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5">
                <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-2">Assigned To</p>
                <p
                  className={`text-[#4a4455] text-[14px] font-medium ${getUserById(report.assigned_to) ? 'cursor-pointer hover:text-[#630ed4]' : ''}`}
                  onClick={() => getUserById(report.assigned_to) && navigate(`/profile/${report.assigned_to}`)}
                >
                  {getUserById(report.assigned_to)?.full_name || `Moderator Admin #${report.assigned_to}`}
                </p>
              </div>
            )}

            <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-5 flex flex-col gap-2">
              <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider">Timeline</p>
              <div>
                <p className="text-[11px] text-[#7b7487]">Filed</p>
                <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(report.created_at)}</p>
              </div>
              {report.updated_at && (
                <div>
                  <p className="text-[11px] text-[#7b7487]">Last Updated</p>
                  <p className="text-[#191c1d] text-[14px] font-medium">{formatDate(report.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
