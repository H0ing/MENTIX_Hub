import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFlag,
  FiAlertTriangle,
  FiEye,
  FiSend,
} from 'react-icons/fi';
import {
  mockMentorshipRequests,
  mockCollaborationRequests,
  mockReports,
  mockProjects,
  getUserById,
  getProjectById,
} from '../../data/mockdata';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getUser() {
  try {
    const raw = localStorage.getItem('current_login');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { id: 2 };
}

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
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
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

function Accordion({ label, content, disabled = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-1 text-[16px] font-normal transition-colors ${
          disabled
            ? 'text-[rgba(74,68,85,0.4)] cursor-not-allowed'
            : 'text-[#630ed4] hover:underline'
        }`}
        disabled={disabled}
      >
        {label}
        {!disabled && (open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
      </button>
      {open && !disabled && (
        <div className="mt-2 bg-[#f6f5f5] rounded-[8px] px-3 py-2.5 text-[14px] text-[#4a4455] leading-relaxed">
          {content || <span className="text-gray-400 italic">No content yet.</span>}
        </div>
      )}
    </div>
  );
}

// ─── Request cards (My Requests tab) ─────────────────────────────────────────

function SentRequestCard({ type, id, name, role, topic, status, sentMessage, replyMessage, hasReply, date }) {
  const t = TYPE_STYLES[type];
  const navigate = useNavigate();

  const requestPath = type === 'mentorship' ? `/mentor-request/${id}` : `/collab-request/${id}`;
  const responsePath = type === 'mentorship' ? `/mentor-response/${id}` : `/collab-response/${id}`;

  const canViewReply = hasReply && (status === 'accepted' || status === 'rejected');

  return (
    <div
      className={`bg-white border border-[#ccc3d8] border-l-4 ${t.border} rounded-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 min-h-[200px]`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <TypePill type={type} />
        <StatusBadge status={status} />
      </div>

      {/* Person info */}
      <div>
        <p className="text-[18px] font-bold text-[#191c1d] leading-tight">{name}</p>
        <p className="text-[12px] font-medium text-[#4a4455] mt-0.5">{role}</p>
      </div>

      {/* Topic */}
      <p className="text-[16px] italic text-[#4a4455] leading-snug flex-1">{topic}</p>

      <p className="text-[11px] text-gray-400">{date}</p>

      {/* Actions */}
      <div className="border-t border-[rgba(204,195,216,0.3)] pt-3 flex flex-col gap-2">
        <button
          onClick={() => navigate(requestPath)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[14px] font-medium hover:underline transition-colors"
        >
          <FiEye size={14} /> View Full Request
        </button>

        {canViewReply ? (
          <button
            onClick={() => navigate(responsePath)}
            className="flex items-center gap-1.5 text-[#630ed4] text-[14px] font-medium hover:underline transition-colors"
          >
            <FiSend size={14} /> View Reply
          </button>
        ) : status === 'pending' ? (
          <span className="text-[13px] text-gray-400 italic">Waiting for response...</span>
        ) : (
          <span className="text-[13px] text-[rgba(74,68,85,0.4)] italic cursor-not-allowed">No reply</span>
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
  sentMessage,
  myReply,
  hasReply,
  date,
  onAccept,
  onReject,
}) {
  const t = TYPE_STYLES[type];
  const navigate = useNavigate();

  const requestPath = type === 'mentorship' ? `/mentor-request/${id}` : `/collab-request/${id}`;
  const respondPath = type === 'mentorship' ? `/mentor-response/${id}` : `/collab-response/${id}`;

  return (
    <div
      className={`bg-white border border-[#ccc3d8] border-l-4 ${t.border} rounded-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 min-h-[200px]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <TypePill type={type} />
        <StatusBadge status={status} />
      </div>

      {/* Person info */}
      <div>
        <p className="text-[18px] font-bold text-[#191c1d] leading-tight">{name}</p>
        <p className="text-[12px] font-medium text-[#4a4455] mt-0.5">{role}</p>
      </div>

      <p className="text-[16px] italic text-[#4a4455] leading-snug flex-1">{topic}</p>

      <p className="text-[11px] text-gray-400">{date}</p>

      {/* Actions */}
      <div className="border-t border-[rgba(204,195,216,0.3)] pt-3 flex flex-col gap-2">
        <button
          onClick={() => navigate(requestPath)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[14px] font-medium hover:underline transition-colors"
        >
          <FiEye size={14} /> View Detail
        </button>

        {status === 'pending' && onAccept && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={onAccept}
              className="flex-1 bg-[#008321] text-white text-[12px] font-medium py-1.5 rounded-[10px] hover:bg-[#006819] transition-colors"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-[#df0000] text-white text-[12px] font-medium py-1.5 rounded-[10px] hover:bg-[#bb0000] transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {status === 'accepted' && hasReply && (
          <button
            onClick={() => navigate(respondPath)}
            className="flex items-center gap-1.5 text-[#630ed4] text-[14px] font-medium hover:underline transition-colors"
          >
            <FiSend size={14} /> View My Reply
          </button>
        )}

        {status === 'accepted' && !hasReply && (
          <span className="text-[13px] text-gray-400 italic">Accepted — no reply yet</span>
        )}

        {status === 'rejected' && (
          <span className="text-[13px] text-[rgba(74,68,85,0.4)] italic cursor-not-allowed">
            {hasReply ? 'Reply not available' : 'Declined — no reply'}
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
    <div className="bg-white border border-[#ccc3d8] border-l-4 border-l-orange-400 rounded-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <FiFlag size={10} /> {incoming ? 'INCOMING FLAG' : 'FILED FLAG'}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`${priorityColors[priority?.toLowerCase()] || priorityColors.medium} text-[10px] font-bold uppercase px-2 py-0.5 rounded-full`}
          >
            {priority}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Project */}
      <div>
        <p className="text-[11px] text-[#7b7487] uppercase tracking-wide mb-0.5">Project</p>
        <p className="text-[18px] font-bold text-[#191c1d] leading-tight">
          {project?.title || 'Unknown Project'}
        </p>
        {project?.description && (
          <p className="text-[12px] text-[#4a4455] mt-0.5 line-clamp-1">{project.description}</p>
        )}
      </div>

      {/* Reporter — only for incoming flags */}
      {incoming && reporter && (
        <div>
          <p className="text-[11px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reported by</p>
          <p className="text-[14px] font-medium text-[#191c1d]">{reporter.full_name}</p>
        </div>
      )}

      {/* Reason */}
      <div>
        <p className="text-[11px] text-[#7b7487] uppercase tracking-wide mb-0.5">Reason</p>
        <p className="text-[14px] font-medium text-[#4a4455] italic line-clamp-2">{reason}</p>
      </div>

      <p className="text-[11px] text-gray-400">{date}</p>

      {/* Navigate to detail */}
      <div className="border-t border-[rgba(204,195,216,0.3)] pt-3">
        <button
          onClick={() => navigate(`/report-detail/${id}`)}
          className="flex items-center gap-1.5 text-[#630ed4] text-[14px] font-medium hover:underline transition-colors"
        >
          <FiEye size={14} /> View Full Report
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
      <p className="text-5xl">📭</p>
      <p className="text-lg">{message}</p>
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
  const navigate = useNavigate();
  const user = getUser();
  const userId = user.id;

  const [activeTab, setActiveTab] = useState('my_request');
  const [reportTab, setReportTab] = useState('filed');

  // ── My Requests (what I sent) ────────────────────
  const sentMentorships = mockMentorshipRequests.filter((r) => r.student_id === userId);
  const sentCollaborations = mockCollaborationRequests.filter((r) => r.sender_id === userId);

  // ── My Reply (what others sent to me) ────────────
  const [mentorships, setMentorships] = useState(
    mockMentorshipRequests.filter((r) => r.mentor_id === userId)
  );
  const [collaborations, setCollaborations] = useState(
    mockCollaborationRequests.filter((r) => r.receiver_id === userId)
  );

  function acceptMentorship(id) {
    setMentorships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
    );
  }
  function rejectMentorship(id) {
    setMentorships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  }
  function acceptCollab(id) {
    setCollaborations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
    );
  }
  function rejectCollab(id) {
    setCollaborations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  }

  // ── Flag Center ──────────────────────────────────
  const myProjects = mockProjects.filter((p) => p.author_id === userId);
  const myProjectIds = myProjects.map((p) => p.id);

  const filedReports = mockReports.filter((r) => r.reported_by === userId);
  const incomingReports = mockReports.filter(
    (r) => myProjectIds.includes(r.project_id) && r.reported_by !== userId
  );

  // ── Card data builders ────────────────────────────

  function buildSentMentorshipCard(req) {
    const mentor = getUserById(req.mentor_id);
    let replyMsg = null;
    try {
      replyMsg = JSON.parse(req.mentor_response || '{}')?.message;
    } catch {}
    return {
      key: `m-${req.id}`,
      id: req.id,
      type: 'mentorship',
      name: mentor?.full_name || 'Unknown Mentor',
      role: `${mentor?.role || 'Mentor'} • ${mentor?.email?.split('@')[0] || ''}`,
      topic: `Topic: ${req.help_needed?.slice(0, 60)}...`,
      status: req.status,
      sentMessage: req.project_context,
      replyMessage: replyMsg,
      hasReply: !!req.mentor_response,
      date: formatDate(req.created_at),
    };
  }

  function buildSentCollabCard(req) {
    const receiver = getUserById(req.receiver_id);
    let replyMsg = null;
    try {
      replyMsg = JSON.parse(req.response_message || '{}')?.message;
    } catch {}
    return {
      key: `c-${req.id}`,
      id: req.id,
      type: 'collaboration',
      name: receiver?.full_name || 'Unknown Person',
      role: `${receiver?.role || 'User'} • ${receiver?.username || ''}`,
      topic: `Project: ${req.project_interested?.slice(0, 50)}...`,
      status: req.status,
      sentMessage: req.intro,
      replyMessage: replyMsg,
      hasReply: !!req.response_message,
      date: formatDate(req.created_at),
    };
  }

  function buildReceivedMentorshipCard(req) {
    const student = getUserById(req.student_id);
    let myReply = null;
    try {
      myReply = JSON.parse(req.mentor_response || '{}')?.message;
    } catch {}
    return {
      key: `rm-${req.id}`,
      id: req.id,
      type: 'mentorship',
      name: student?.full_name || 'Unknown Student',
      role: `${student?.role || 'Student'} • ${student?.email?.split('@')[0] || ''}`,
      topic: `Topic: ${req.help_needed?.slice(0, 60)}`,
      status: req.status,
      sentMessage: req.project_context,
      myReply,
      hasReply: !!req.mentor_response,
      date: formatDate(req.created_at),
    };
  }

  function buildReceivedCollabCard(req) {
    const sender = getUserById(req.sender_id);
    let myReply = null;
    try {
      myReply = JSON.parse(req.response_message || '{}')?.message;
    } catch {}
    return {
      key: `rc-${req.id}`,
      id: req.id,
      type: 'collaboration',
      name: sender?.full_name || 'Unknown Person',
      role: `${sender?.role || 'User'} • ${sender?.username || ''}`,
      topic: `Project: ${req.project_interested?.slice(0, 60)}`,
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

  const receivedMentorshipCards = mentorships.map(buildReceivedMentorshipCard);
  const receivedCollabCards = collaborations.map(buildReceivedCollabCard);
  const receivedCards = [...receivedMentorshipCards, ...receivedCollabCards];

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-10 font-[Inter,sans-serif]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[36px] font-bold text-[#191c1d] tracking-tight">My Requests</h1>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#edeeef] rounded-[12px] p-1 gap-0.5">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-[8px] text-[14px] font-bold transition-all ${
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
        <div className="grid grid-cols-4 gap-5">
          {sentCards.length === 0 ? (
            <EmptyState message="You haven't sent any requests yet." />
          ) : (
            sentCards.map((card) => <SentRequestCard key={card.key} {...card} />)
          )}
        </div>
      )}

      {/* ── My Reply tab ─────────────────────────────────────────────── */}
      {activeTab === 'my_reply' && (
        <div className="grid grid-cols-4 gap-5">
          {receivedCards.length === 0 ? (
            <EmptyState message="No incoming requests for you yet." />
          ) : (
            receivedCards.map((card) =>
              card.type === 'mentorship' ? (
                <ReceivedRequestCard
                  key={card.key}
                  {...card}
                  onAccept={
                    card.status === 'pending' ? () => acceptMentorship(card.id) : null
                  }
                  onReject={
                    card.status === 'pending' ? () => rejectMentorship(card.id) : null
                  }
                />
              ) : (
                <ReceivedRequestCard
                  key={card.key}
                  {...card}
                  onAccept={
                    card.status === 'pending' ? () => acceptCollab(card.id) : null
                  }
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
          <div className="flex gap-6 border-b border-[#919191] mb-6">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportTab(tab.id)}
                className={`pb-2.5 text-[16px] font-semibold relative transition-colors ${
                  reportTab === tab.id ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
                }`}
              >
                {tab.label}
                {reportTab === tab.id && (
                  <span className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#630ed4] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Flags I Raised */}
          {reportTab === 'filed' && (
            <div className="grid grid-cols-4 gap-5">
              {filedReports.length === 0 ? (
                <EmptyState message="You haven't filed any reports yet." />
              ) : (
                filedReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    id={report.id}
                    project={getProjectById(report.project_id)}
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
            <div className="grid grid-cols-4 gap-5">
              {incomingReports.length === 0 ? (
                <EmptyState message="No reports filed against your projects." />
              ) : (
                incomingReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    id={report.id}
                    project={getProjectById(report.project_id)}
                    reason={report.reason}
                    status={report.status}
                    priority={report.priority}
                    date={formatDate(report.created_at)}
                    incoming={true}
                    reporter={getUserById(report.reported_by)}
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