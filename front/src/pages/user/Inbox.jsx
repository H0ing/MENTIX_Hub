import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFlag,
  FiAlertTriangle,
  FiEye,
  FiSend,
} from 'react-icons/fi';
import {
  getMyMentorshipRequests,
  getReceivedMentorshipRequests,
  respondToMentorship,
} from '../../api/mentorshipApi';
import {
  getMyCollaborationRequests,
  getReceivedCollaborationRequests,
  respondToCollaboration,
} from '../../api/collaborationApi';
import {
  getMyReports,
  getReportsOnMyProjects,
} from '../../api/reportApi';

// ─── Route helpers ─────────────────────────────────────────────────────────────
// The "View Detail" for a *received* request uses the same detail page as sent
// requests — both sides can view the full request via /collab-request/:id or
// /mentor-request/:id. The respond (reply) form pages live at separate paths and
// expect the id passed via navigation state.

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── sub-components ───────────────────────────────────────────────────────────

const TYPE_STYLES = {
  mentorship: {
    pill: 'bg-[#6ffbbe] text-[#002113]',
    border: 'border-l-[#008321]',
    label: 'MENTORSHIP',
  },
  collaboration: {
    pill: 'bg-[#d8e2ff] text-[#001a42]',
    border: 'border-l-[#2b1bff]',
    label: 'COLLABORATE',
  },
  report: {
    pill: 'bg-orange-100 text-orange-800',
    border: 'border-l-orange-400',
    label: 'REPORT',
  },
};

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

function TypePill({ type }) {
  const t = TYPE_STYLES[type] || TYPE_STYLES.mentorship;
  return (
    <span
      className={`${t.pill} text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full`}
    >
      {t.label}
    </span>
  );
}

// ─── Request cards (My Requests tab) ─────────────────────────────────────────

function SentRequestCard({ type, id, name, role, topic, status, hasReply, date }) {
  const t = TYPE_STYLES[type];
  const navigate = useNavigate();

  const requestPath = type === 'mentorship' ? `/mentor-request/${id}` : `/collab-request/${id}`;
  const responsePath = type === 'mentorship' ? `/mentor-response/${id}` : `/collab-response/${id}`;

  const canViewReply = hasReply && (status === 'accepted' || status === 'rejected');

  return (
    <div
      className={`bg-white border border-[#ccc3d8] border-l-4 ${t.border} rounded-[12px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col gap-2.5 min-h-[180px]`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <TypePill type={type} />
        <StatusBadge status={status} />
      </div>

      {/* Person info */}
      <div>
        <p className="text-[15px] font-bold text-[#191c1d] leading-tight">{name}</p>
        <p className="text-[11px] font-medium text-[#4a4455] mt-0.5">{role}</p>
      </div>

      {/* Topic */}
      <p className="text-[13px] italic text-[#4a4455] leading-snug flex-1">{topic}</p>

      <p className="text-[10px] text-gray-400">{date}</p>

      {/* Actions */}
      <div className="border-t border-[rgba(204,195,216,0.3)] pt-2.5 flex flex-col gap-1.5">
        <button
          onClick={() => navigate(requestPath)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
        >
          <FiEye size={12} /> View Full Request
        </button>

        {canViewReply ? (
          <button
            onClick={() => navigate(responsePath)}
            className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
          >
            <FiSend size={12} /> View Reply
          </button>
        ) : status === 'pending' ? (
          <span className="text-[11px] text-gray-400 italic">Waiting for response...</span>
        ) : (
          <span className="text-[11px] text-[rgba(74,68,85,0.4)] italic cursor-not-allowed">No reply</span>
        )}
      </div>
    </div>
  );
}

// ─── Reply cards (My Reply tab — requests I received) ─────────────────────────

function ReceivedRequestCard({
  type,
  id,
  name,
  role,
  topic,
  status,
  hasReply,
  date,
  onReject,
}) {
  const t = TYPE_STYLES[type];
  const navigate = useNavigate();

  // Both sender and receiver can view the full request detail at the same path
  const requestPath = type === 'mentorship' ? `/mentor-request/${id}` : `/collab-request/${id}`;
  // Path to the respond form — passes id via navigation state so the form can pre-load the request
  const respondFormPath = type === 'mentorship' ? '/respond-mentorship' : '/accept-collaboration';
  // Path to view the reply they already wrote
  const respondPath = type === 'mentorship' ? `/mentor-response/${id}` : `/collab-response/${id}`;

  return (
    <div
      className={`bg-white border border-[#ccc3d8] border-l-4 ${t.border} rounded-[12px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-3.5 flex flex-col gap-2.5 min-h-[180px]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <TypePill type={type} />
        <StatusBadge status={status} />
      </div>

      {/* Person info */}
      <div>
        <p className="text-[15px] font-bold text-[#191c1d] leading-tight">{name}</p>
        <p className="text-[11px] font-medium text-[#4a4455] mt-0.5">{role}</p>
      </div>

      <p className="text-[13px] italic text-[#4a4455] leading-snug flex-1">{topic}</p>

      <p className="text-[10px] text-gray-400">{date}</p>

      {/* Actions */}
      <div className="border-t border-[rgba(204,195,216,0.3)] pt-2.5 flex flex-col gap-1.5">
        <button
          onClick={() => navigate(requestPath)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
        >
          <FiEye size={12} /> View Detail
        </button>

        {status === 'pending' && (
          <div className="flex gap-1.5 mt-0.5">
            {/* Accept navigates to the reply form — the form itself calls the API */}
            <button
              onClick={() => navigate(respondFormPath, { state: { id } })}
              className="flex-1 bg-[#008321] text-white text-[11px] font-medium py-1.5 rounded-[8px] hover:bg-[#006819] transition-colors"
            >
              Accept & Reply
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-[#df0000] text-white text-[11px] font-medium py-1.5 rounded-[8px] hover:bg-[#bb0000] transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {status === 'accepted' && hasReply && (
          <button
            onClick={() => navigate(respondPath)}
            className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
          >
            <FiSend size={12} /> View My Reply
          </button>
        )}

        {status === 'accepted' && !hasReply && (
          <button
            onClick={() => navigate(respondFormPath, { state: { id } })}
            className="flex items-center gap-1.5 text-[#630ed4] text-[12px] font-medium hover:underline transition-colors"
          >
            <FiSend size={12} /> Write Reply
          </button>
        )}

        {status === 'rejected' && (
          <span className="text-[11px] text-[rgba(74,68,85,0.4)] italic cursor-not-allowed">
            Declined — no reply sent
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Report cards (Flag Center tab) ──────────────────────────────────────────

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
      {/* Header */}
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

      {/* Project */}
      <div>
        <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Project</p>
        <p className="text-[15px] font-bold text-[#191c1d] leading-tight">
          {project?.title || 'Unknown Project'}
        </p>
        {project?.description && (
          <p className="text-[11px] text-[#4a4455] mt-0.5 line-clamp-1">{project.description}</p>
        )}
      </div>

      {/* Reporter — only for incoming flags */}
      {incoming && reporter && (
        <div>
          <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reported by</p>
          <p className="text-[12px] font-medium text-[#191c1d]">{reporter.full_name}</p>
        </div>
      )}

      {/* Reason */}
      <div>
        <p className="text-[10px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reason</p>
        <p className="text-[12px] font-medium text-[#4a4455] italic line-clamp-2">{reason}</p>
      </div>

      <p className="text-[10px] text-gray-400">{date}</p>

      {/* Navigate to detail */}
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 gap-1.5">
      <p className="text-3xl">📭</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'my_request', label: 'My Requests' },
  { id: 'my_reply', label: 'My Reply' },
  { id: 'flag_center', label: 'Flag Center' },
];

const REPORT_TABS = [
  { id: 'filed', label: 'Flags I Raised' },
  { id: 'incoming', label: 'Flags on My Work' },
];

export default function Inbox() {

  const [activeTab, setActiveTab] = useState('my_request');
  const [reportTab, setReportTab] = useState('filed');
  const [loading, setLoading] = useState(true);

  const [sentMentorships, setSentMentorships] = useState([]);
  const [sentCollaborations, setSentCollaborations] = useState([]);
  const [receivedMentorships, setReceivedMentorships] = useState([]);
  const [receivedCollaborations, setReceivedCollaborations] = useState([]);
  const [filedReports, setFiledReports] = useState([]);
  const [incomingReports, setIncomingReports] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [
          sentMRes, sentCRes,
          recvMRes, recvCRes,
          filedRes, incomingRes,
        ] = await Promise.allSettled([
          getMyMentorshipRequests({ page: 1, limit: 50 }),
          getMyCollaborationRequests({ page: 1, limit: 50 }),
          getReceivedMentorshipRequests({ page: 1, limit: 50 }),
          getReceivedCollaborationRequests({ page: 1, limit: 50 }),
          getMyReports({ page: 1, limit: 50 }),
          getReportsOnMyProjects({ page: 1, limit: 50 }),
        ]);

        if (sentMRes.status === 'fulfilled') setSentMentorships(sentMRes.value.data.data || []);
        if (sentCRes.status === 'fulfilled') setSentCollaborations(sentCRes.value.data.data || []);
        if (recvMRes.status === 'fulfilled') setReceivedMentorships(recvMRes.value.data.data || []);
        if (recvCRes.status === 'fulfilled') setReceivedCollaborations(recvCRes.value.data.data || []);
        if (filedRes.status === 'fulfilled') setFiledReports(filedRes.value.data.data || []);
        if (incomingRes.status === 'fulfilled') setIncomingReports(incomingRes.value.data.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchAll();
  }, []);

  async function rejectMentorship(id) {
    try {
      await respondToMentorship(id, { status: 'rejected', mentor_response: null });
      setReceivedMentorships((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      );
    } catch (err) {
      console.error('Failed to reject mentorship:', err);
    }
  }

  async function rejectCollab(id) {
    try {
      await respondToCollaboration(id, { status: 'rejected', response_message: null });
      setReceivedCollaborations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      );
    } catch (err) {
      console.error('Failed to reject collaboration:', err);
    }
  }

  // ── Card data builders ────────────────────────────

  function buildSentMentorshipCard(req) {
    let replyMsg = null;
    try {
      replyMsg = JSON.parse(req.mentor_response || '{}')?.message;
    } catch {}
    return {
      key: `m-${req.id}`,
      id: req.id,
      type: 'mentorship',
      name: req.mentor_name || 'Unknown Mentor',
      role: req.mentor_username || '',
      topic: req.help_needed ? `Topic: ${req.help_needed.slice(0, 60)}${req.help_needed.length > 60 ? '...' : ''}` : 'Topic: –',
      status: req.status,
      sentMessage: req.project_context,
      replyMessage: replyMsg,
      hasReply: !!req.mentor_response,
      date: formatDate(req.created_at),
    };
  }

  function buildSentCollabCard(req) {
    let replyMsg = null;
    try {
      replyMsg = JSON.parse(req.response_message || '{}')?.message;
    } catch {}
    return {
      key: `c-${req.id}`,
      id: req.id,
      type: 'collaboration',
      name: req.receiver_name || 'Unknown Person',
      role: req.receiver_username || '',
      topic: req.project_interested ? `Project: ${req.project_interested.slice(0, 50)}${req.project_interested.length > 50 ? '...' : ''}` : 'Project: –',
      status: req.status,
      sentMessage: req.intro,
      replyMessage: replyMsg,
      hasReply: !!req.response_message,
      date: formatDate(req.created_at),
    };
  }

  function buildReceivedMentorshipCard(req) {
    let myReply = null;
    try {
      myReply = JSON.parse(req.mentor_response || '{}')?.message;
    } catch {}
    return {
      key: `rm-${req.id}`,
      id: req.id,
      type: 'mentorship',
      name: req.student_name || 'Unknown Student',
      role: req.student_username || '',
      topic: req.help_needed ? `Topic: ${req.help_needed.slice(0, 60)}${req.help_needed.length > 60 ? '...' : ''}` : 'Topic: –',
      status: req.status,
      sentMessage: req.project_context,
      myReply,
      hasReply: !!req.mentor_response,
      date: formatDate(req.created_at),
    };
  }

  function buildReceivedCollabCard(req) {
    let myReply = null;
    try {
      myReply = JSON.parse(req.response_message || '{}')?.message;
    } catch {}
    return {
      key: `rc-${req.id}`,
      id: req.id,
      type: 'collaboration',
      name: req.sender_name || 'Unknown Person',
      role: req.sender_username || '',
      topic: req.project_interested ? `Project: ${req.project_interested.slice(0, 60)}${req.project_interested.length > 60 ? '...' : ''}` : 'Project: –',
      status: req.status,
      sentMessage: req.intro,
      myReply,
      hasReply: !!req.response_message,
      date: formatDate(req.created_at),
    };
  }

  const sentCards = [
    ...sentMentorships.map(buildSentMentorshipCard),
    ...sentCollaborations.map(buildSentCollabCard),
  ];

  const receivedMentorshipCards = receivedMentorships.map(buildReceivedMentorshipCard);
  const receivedCollabCards = receivedCollaborations.map(buildReceivedCollabCard);
  const receivedCards = [...receivedMentorshipCards, ...receivedCollabCards];

  const headerTitle = {
    my_request: 'My Requests',
    my_reply: 'My Reply',
    flag_center: 'Report Center',
  }[activeTab];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#191c1d] tracking-tight">{headerTitle}</h1>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#edeeef] rounded-[8px] p-0.5 gap-0.5">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-[6px] text-[12px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#630ed4] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]'
                  : 'text-[#4a4455] hover:text-[#630ed4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── My Requests tab ─────────────────────────────────────────── */}
      {activeTab === 'my_request' && (
        <div className="grid grid-cols-4 gap-4">
          {sentCards.length === 0 ? (
            <EmptyState message="You haven't sent any requests yet." />
          ) : (
            sentCards.map((card) => <SentRequestCard key={card.key} {...card} />)
          )}
        </div>
      )}

      {/* ── My Reply tab ─────────────────────────────────────────────── */}
      {activeTab === 'my_reply' && (
        <div className="grid grid-cols-4 gap-4">
          {receivedCards.length === 0 ? (
            <EmptyState message="No incoming requests for you yet." />
          ) : (
            receivedCards.map((card) =>
              card.type === 'mentorship' ? (
                <ReceivedRequestCard
                  key={card.key}
                  {...card}
                  onReject={
                    card.status === 'pending' ? () => rejectMentorship(card.id) : null
                  }
                />
              ) : (
                <ReceivedRequestCard
                  key={card.key}
                  {...card}
                  onReject={
                    card.status === 'pending' ? () => rejectCollab(card.id) : null
                  }
                />
              )
            )
          )}
        </div>
      )}

      {/* ── Flag Center tab ──────────────────────────────────────────── */}
      {activeTab === 'flag_center' && (
        <div>
          {/* Sub-tabs */}
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

          {/* Flags I Raised */}
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

          {/* Flags on My Work */}
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
      )}
    </div>
  );
}