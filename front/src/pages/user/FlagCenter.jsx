import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFlag,
  FiAlertTriangle,
  FiEye,
} from 'react-icons/fi';
import {
  getMyReports,
  getReportsOnMyProjects,
} from '../../api/reportApi';

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES = {
  accepted: { bg: 'bg-[#008321]', icon: <FiCheckCircle size={12} />, label: 'ACCEPTED' },
  pending: { bg: 'bg-[#2b1bff]', icon: <FiClock size={12} />, label: 'PENDING' },
  rejected: { bg: 'bg-[#f30000]', icon: <FiXCircle size={12} />, label: 'REJECTED' },
  under_review: { bg: 'bg-amber-500', icon: <FiAlertTriangle size={12} />, label: 'UNDER REVIEW' },
  resolved: { bg: 'bg-green-600', icon: <FiCheckCircle size={12} />, label: 'RESOLVED' },
};

function StatusBadge({ status }) {
  const normalized = status === 'under_review' ? 'pending' : status;
  const s = STATUS_STYLES[normalized] || STATUS_STYLES.pending;
  return (
    <span
      className={`${s.bg} text-white text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1`}
    >
      {s.icon} {s.label}
    </span>
  );
}

function ReportCard({ id, project, reason, status, priority, date, incoming = false, reporter }) {
  const navigate = useNavigate();
  const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-[#ccc3d8] border-l-4 border-l-orange-400 rounded-[12px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col gap-2.5 min-h-[180px]">
      <div className="flex items-center justify-between">
        <span className="bg-orange-100 text-orange-800 text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <FiFlag size={9} /> {incoming ? 'INCOMING FLAG' : 'FILED FLAG'}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`${priorityColors[priority?.toLowerCase()] || priorityColors.medium} text-[9px] font-bold uppercase px-2 py-0.5 rounded-full`}
          >
            {priority}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Project</p>
        <p className="text-[15px] font-bold text-[#191c1d] leading-tight">
          {project?.title || 'Unknown Project'}
        </p>
        {project?.description && (
          <p className="text-[11px] text-[#4a4455] mt-0.5 line-clamp-1">{project.description}</p>
        )}
      </div>

      {incoming && reporter && (
        <div>
          <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reported by</p>
          <p className="text-[12px] font-medium text-[#191c1d]">{reporter.full_name}</p>
        </div>
      )}

      <div>
        <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reason</p>
        <p className="text-[12px] font-medium text-[#4a4455] italic line-clamp-2">{reason}</p>
      </div>

      <p className="text-[10px] text-gray-400">{date}</p>

      <div className="border-t border-[rgba(204,195,216,0.3)] pt-2.5">
        <button
          onClick={() => navigate(`/report-detail/${id}`)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
        >
          <FiEye size={12} /> View Full Report
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 gap-1.5">
      <p className="text-3xl">📭</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

const REPORT_TABS = [
  { id: 'filed', label: 'Flags I Raised' },
  { id: 'incoming', label: 'Flags on My Work' },
];

export default function FlagCenter() {
  const [reportTab, setReportTab] = useState('filed');
  const [loading, setLoading] = useState(true);
  const [filedReports, setFiledReports] = useState([]);
  const [incomingReports, setIncomingReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [filedRes, incomingRes] = await Promise.allSettled([
          getMyReports({ page: 1, limit: 50 }),
          getReportsOnMyProjects({ page: 1, limit: 50 }),
        ]);

        if (filedRes.status === 'fulfilled') setFiledReports(filedRes.value.data.data || []);
        if (incomingRes.status === 'fulfilled') setIncomingReports(incomingRes.value.data.data || []);
      } catch { void 0; }
      setLoading(false);
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">Flag Center</h1>
      </div>

      <div className="flex gap-5 border-b border-[#919191] mb-5">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportTab(tab.id)}
            className={`pb-2 text-[14px] font-semibold relative transition-colors ${
              reportTab === tab.id ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
            }`}
          >
            {tab.label}
            {reportTab === tab.id && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-[#630ed4] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {reportTab === 'filed' && (
        <div className="grid grid-cols-4 gap-4">
          {filedReports.length === 0 ? (
            <EmptyState message="You haven't filed any reports yet." />
          ) : (
            filedReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                project={{ title: report.project_title }}
                reason={report.reason}
                status={report.status}
                priority={report.priority}
                date={formatDate(report.created_at)}
                incoming={false}
              />
            ))
          )}
        </div>
      )}

      {reportTab === 'incoming' && (
        <div className="grid grid-cols-4 gap-4">
          {incomingReports.length === 0 ? (
            <EmptyState message="No reports filed against your projects." />
          ) : (
            incomingReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                project={{ title: report.project_title }}
                reason={report.reason}
                status={report.status}
                priority={report.priority}
                date={formatDate(report.created_at)}
                incoming={true}
                reporter={{ full_name: report.reporter_name }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
