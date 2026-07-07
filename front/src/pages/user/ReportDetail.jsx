import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiFlag, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { getReportById } from '../../api/reportApi';

const STATUS_STYLES = {
  resolved: { bg: 'bg-[#008321]', icon: <FiCheckCircle size={14} />, label: 'Resolved' },
  under_review: { bg: 'bg-amber-500', icon: <FiClock size={14} />, label: 'Under Review' },
  pending: { bg: 'bg-[#2b1bff]', icon: <FiAlertTriangle size={14} />, label: 'Pending' },
  dismissed: { bg: 'bg-gray-500', icon: <FiXCircle size={14} />, label: 'Dismissed' },
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

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportById(id)
      .then(({ data }) => setReport(data.data))
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

  if (!report) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <p className="text-base text-gray-400">Report not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#630ed4] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const displayStatus = report.status === 'under_review' ? 'pending' : report.status;
  const statusStyle = STATUS_STYLES[displayStatus] || STATUS_STYLES.pending;
  const priorityStyle = PRIORITY_COLORS[report.priority] || PRIORITY_COLORS.Medium;

  let reviewNotes = null;
  try {
    reviewNotes = report.review_notes ? JSON.parse(report.review_notes) : null;
  } catch {
    reviewNotes = report.review_notes;
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[1000px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Report Detail</h1>
              <p className="text-[#4a4455] text-[14px] mt-0.5">Filed {formatDate(report.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`${priorityStyle} text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full`}>
              {report.priority}
            </span>
            <span className={`${statusStyle.bg} text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
              {statusStyle.icon} {statusStyle.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[rgba(204,195,216,0.3)]">
                <FiFlag size={16} className="text-[#630ed4]" />
                <span className="text-[#630ed4] font-semibold text-[12px] uppercase tracking-wider">Report Details</span>
              </div>

              <InfoBlock label="Project">
                <p className="text-[#191c1d] font-semibold text-[15px]">{report.project_title || 'Unknown Project'}</p>
              </InfoBlock>

              <InfoBlock label="Problem">
                <p className="text-[#4a4455] text-[14px] leading-relaxed bg-[#f6f5f5] rounded-[6px] px-3 py-2.5">{report.description}</p>
              </InfoBlock>

              <InfoBlock label="Reason">
                <p className="text-[#4a4455] text-[14px] italic leading-relaxed">{report.reason}</p>
              </InfoBlock>
            </div>

            {reviewNotes && (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5">
                <InfoBlock label="Review Notes">
                  <p className="text-[#4a4455] text-[14px] leading-relaxed">
                    {typeof reviewNotes === 'object' ? JSON.stringify(reviewNotes, null, 2) : reviewNotes}
                  </p>
                </InfoBlock>
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-3">Reported by</p>
              <div className="flex items-center gap-2.5 p-1 -m-1">
                <UserAvatar fullName={report.reporter_name} avatarUrl={report.reporter_avatar} />
                <div>
                  <p className="text-[#191c1d] font-semibold text-[14px]">{report.reporter_name || 'Unknown'}</p>
                  <p className="text-[#4a4455] text-[11px]">@{report.reporter_username || 'user'}</p>
                </div>
              </div>
            </div>

            {report.assignee_name && (
              <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4">
                <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider mb-1.5">Assigned To</p>
                <p className="text-[#4a4455] text-[13px] font-medium">{report.assignee_name}</p>
              </div>
            )}

            <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-4 flex flex-col gap-1.5">
              <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider">Timeline</p>
              <div>
                <p className="text-[10px] text-[#7b7487]">Filed</p>
                <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(report.created_at)}</p>
              </div>
              {report.updated_at && (
                <div>
                  <p className="text-[10px] text-[#7b7487]">Last Updated</p>
                  <p className="text-[#191c1d] text-[13px] font-medium">{formatDate(report.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
