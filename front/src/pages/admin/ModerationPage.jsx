import { useState, useEffect, useCallback } from 'react';
import { Tabs }           from '../../components/shared/Tabs';
import Table, { Tr, Td } from '../../components/shared/Table';
import Modal              from '../../components/shared/Modal';
import Button             from '../../components/shared/Button';
import StatusTag          from '../../components/shared/StatusTag';
import Loading            from '../../components/shared/Loading';
import { Textarea, Select as FormSelect } from '../../components/shared/Input';
import { useToast }       from '../../components/shared/Toast';
import { getCurrentAdmin, can } from '../../services/authService';
import * as reportService    from '../../services/reportService';
import * as promotionService from '../../services/promotionService';

// ── Time helper ───────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000); // days
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ago  = diff === 0 ? 'today'
             : diff === 1 ? '1 day ago'
             : `${diff} days ago`;
  return `${date}, ${time} (${ago})`;
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'reports', label: 'Reports' },
  { id: 'promo',   label: 'Mentor Promotion' },
];

export default function ModerationPage() {
  const showToast    = useToast();
  const currentAdmin = getCurrentAdmin();
  const [tab, setTab] = useState('reports');

  // ── Reports ────────────────────────────────────────────────────────────────
  const [reports, setReports]       = useState([]);
  const [repLoading, setRepLoading] = useState(true);
  const [repError, setRepError]     = useState('');
  const [repFilter, setRepFilter]   = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [dismissModal, setDismissModal] = useState(null);
  const [viewModal, setViewModal]       = useState(null);
  const [resolveType, setResolveType]   = useState('warning');
  const [resolveNote, setResolveNote]   = useState('');
  const [dismissNote, setDismissNote]   = useState('');

  const loadReports = useCallback(async () => {
    setRepLoading(true); setRepError('');
    try {
      const res = await reportService.getReports(repFilter ? { status: repFilter } : {});
      setReports(res.data ?? []);
    } catch (e) {
      setRepError(e.response?.data?.message || 'Failed to load reports.');
    } finally { setRepLoading(false); }
  }, [repFilter]);

  useEffect(() => { if (tab === 'reports') loadReports(); }, [tab, loadReports]);

  async function handleResolve() {
    try {
      await reportService.resolveReport(resolveModal.id, { responseType: resolveType, note: resolveNote });
      showToast(`Report resolved by ${currentAdmin.name}`);
      setResolveModal(null); setResolveNote('');
      loadReports();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to resolve report.'); }
  }

  async function handleDismiss() {
    try {
      await reportService.dismissReport(dismissModal.id, { note: dismissNote });
      showToast(`Report dismissed by ${currentAdmin.name}`);
      setDismissModal(null); setDismissNote('');
      loadReports();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to dismiss report.'); }
  }

  function statusKey(s) {
    const m = { pending: 'pending', under_review: 'under_review', resolved: 'resolved', dismissed: 'resolved' };
    return m[s?.toLowerCase()] ?? 'pending';
  }

  // ── Promotions ─────────────────────────────────────────────────────────────
  const [promoSubTab, setPromoSubTab]   = useState('requests');
  const [promos, setPromos]            = useState([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeKeys, setActiveKeys]     = useState([]);
  const [allStudents, setAllStudents]   = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [enqueuing, setEnqueuing]       = useState(false);
  const [studentPage, setStudentPage]   = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const STUDENT_LIMIT = 10;

  const PROMO_SUB_TABS = [
    { id: 'requests', label: 'Pending Requests' },
    { id: 'students', label: 'All Students' },
  ];

  const REQ_COLUMNS = {
    min_projects:        'Projects',
    min_hearts:          'Hearts',
    min_comments:        'Comments',
    min_account_age_days: 'Acc. Age',
  };

  const loadPromos = useCallback(async () => {
    setPromoLoading(true);
    try {
      const [queueRes, reqRes] = await Promise.all([
        promotionService.getPromotionQueue(),
        promotionService.getMentorRequirements()
      ]);
      setPromos(queueRes.data ?? []);
      const active = (reqRes.data ?? []).filter(r => r.is_active).map(r => r.requirement_key);
      setActiveKeys(active);
    } catch (e) { showToast(e.response?.data?.message || 'Failed to load promotions'); }
    finally { setPromoLoading(false); }
  }, [showToast]);

  const loadStudents = useCallback(async (page = 1) => {
    setStudentsLoading(true);
    try {
      const [eligRes, reqRes] = await Promise.all([
        promotionService.getStudentEligibility({ page, limit: STUDENT_LIMIT }),
        promotionService.getMentorRequirements()
      ]);
      setAllStudents(eligRes.data ?? []);
      setStudentPage(eligRes.pagination?.page ?? 1);
      setStudentTotalPages(eligRes.pagination?.totalPages ?? 1);
      const active = (reqRes.data ?? []).filter(r => r.is_active).map(r => r.requirement_key);
      setActiveKeys(active);
    } catch (e) { showToast(e.response?.data?.message || 'Failed to load students'); }
    finally { setStudentsLoading(false); }
  }, [showToast]);

  async function handleAutoEnqueue() {
    setEnqueuing(true);
    try {
      const res = await promotionService.triggerAutoEnqueue();
      await Promise.all([loadPromos(), loadStudents(studentPage)]);
      showToast(res.data?.enqueued != null ? `${res.data.enqueued} student(s) enqueued` : 'Scan complete');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to scan students');
    } finally {
      setEnqueuing(false);
    }
  }

  useEffect(() => {
    if (tab === 'promo') {
      if (promoSubTab === 'requests') loadPromos();
      else loadStudents(1);
    }
  }, [tab, promoSubTab, loadPromos, loadStudents]);

  async function handleApprove() {
    try {
      await promotionService.approvePromotion(approveModal.id);
      showToast('Promotion approved');
      setApproveModal(null);
      loadPromos();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to approve.'); }
  }

  async function handleReject() {
    try {
      await promotionService.rejectPromotion(rejectModal.id, rejectReason);
      showToast('Promotion rejected');
      setRejectModal(null); setRejectReason('');
      loadPromos();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to reject.'); }
  }

  // Parse requirements_met JSON from backend
  function parseReq(p) {
    let req = p.requirements_met;
    if (typeof req === 'string') { try { req = JSON.parse(req); } catch { req = {}; } }
    return req ?? {};
  }

  function allMet(p) {
    const req = parseReq(p);
    return activeKeys.every(k => req[k]?.met !== false);
  }

  function fmtReqRow(req, key) {
    const r = req[key];
    if (!r) return '—';
    return `${r.actual ?? '?'} / ${r.required ?? '?'} ${r.met ? '✓' : '✗'}`;
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-1.5">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Moderator</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">Review reports and mentor promotions.</p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Reports tab ── */}
      {tab === 'reports' && (
        <>
          <div className="flex gap-3 mb-4">
            <select
              value={repFilter}
              onChange={e => setRepFilter(e.target.value)}
              className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {repLoading ? <Loading /> : repError ? (
            <p className="text-[#E0245E] text-[13px]">{repError}</p>
          ) : (
            <Table
              columns={['Project', 'Priority', 'Reporter', 'Status', 'Reported', 'Actions']}
              toolbar={<h4 className="m-0 text-[14.5px] font-bold">All Reports</h4>}
            >
              {reports.length === 0 ? (
                <Tr><Td colSpan={6} className="text-center text-[#8B8B9E] py-8">No reports found.</Td></Tr>
              ) : reports.map(r => (
                <Tr key={r.id}>
                  <Td><b>{r.project_title}</b></Td>
                  <Td>
                    <span className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full ${
                      r.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      r.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      r.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {r.priority?.toUpperCase() || 'LOW'}
                    </span>
                  </Td>
                  <Td className="text-[12.5px]">{r.reporter_username}</Td>
                  <Td><StatusTag status={statusKey(r.status)} /></Td>
                  <Td className="text-[11.5px] text-[#8B8B9E] whitespace-nowrap">{fmtDate(r.created_at)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => setViewModal(r)}
                        className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#F0EAFC] text-[#7C3AED] border-none cursor-pointer">
                        View
                      </button>
                      {r.status === 'pending' || r.status === 'under_review' ? (
                        <>
                          <button onClick={() => setResolveModal(r)}
                            className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#E9F9EF] text-[#16A34A] border-none cursor-pointer">
                            Resolve
                          </button>
                          <button onClick={() => setDismissModal(r)}
                            className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#FDEAF0] text-[#E0245E] border-none cursor-pointer">
                            Dismiss
                          </button>
                        </>
                      ) : null}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </>
      )}

      {/* ── Promotions tab ── */}
      {tab === 'promo' && (
        <>
          <div className="flex gap-1 mb-4 border-b border-[#ECE9F4]">
            {PROMO_SUB_TABS.map(st => (
              <button key={st.id} onClick={() => setPromoSubTab(st.id)}
                className={`px-4 py-[9px] text-[13px] font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                  promoSubTab === st.id
                    ? 'text-[#7C3AED] border-[#7C3AED]'
                    : 'text-[#8B8B9E] border-transparent hover:text-[#1A1A2E]'
                }`}>
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div />
            {can('promotion_enqueue') && (
              <button onClick={handleAutoEnqueue} disabled={enqueuing}
                className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#7C3AED] text-white border-none cursor-pointer disabled:opacity-50">
                {enqueuing ? 'Scanning...' : 'Scan & Enqueue Eligible'}
              </button>
            )}
          </div>

          {promoSubTab === 'requests' ? (
            promoLoading ? <Loading /> : (
              (() => {
                const eligiblePromos = promos.filter(p => allMet(p));
                return (
              <Table columns={['Student', ...activeKeys.map(k => REQ_COLUMNS[k]).filter(Boolean), 'All Met', 'Actions']}>
                {eligiblePromos.length === 0 ? (
                  <Tr><Td colSpan={activeKeys.length + 3} className="text-center text-[#8B8B9E] py-8">No eligible pending promotions.</Td></Tr>
                ) : eligiblePromos.map(p => {
                  const req = parseReq(p);
                  const met = allMet(p);
                  return (
                    <Tr key={p.id}>
                      <Td>
                        <b>{p.username}</b>
                        <div className="text-[11px] text-[#8B8B9E]">{p.email}</div>
                      </Td>
                      {activeKeys.map(k => (
                        <Td key={k}>{fmtReqRow(req, k)}</Td>
                      ))}
                      <Td>
                        <span className={`text-[11px] font-bold px-2 py-[3px] rounded-full ${met ? 'bg-[#E9F9EF] text-[#16A34A]' : 'bg-[#FEF3E2] text-[#B45309]'}`}>
                          {met ? 'Yes' : 'No'}
                        </span>
                      </Td>
                      <Td>
                        {can('promotion_review') && (
                          <div className="flex gap-2">
                            <button onClick={() => setApproveModal(p)}
                              className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#E9F9EF] text-[#16A34A] border-none cursor-pointer">
                              Approve
                            </button>
                            <button onClick={() => setRejectModal(p)}
                              className="text-[11.5px] font-semibold px-[10px] py-[5px] rounded-[7px] bg-[#FDEAF0] text-[#E0245E] border-none cursor-pointer">
                              Reject
                            </button>
                          </div>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
                );
              })()
            )
          ) : (
            studentsLoading ? <Loading /> : (
              <>
                <Table columns={['Student', ...activeKeys.map(k => REQ_COLUMNS[k]).filter(Boolean), 'All Met']}>
                  {allStudents.length === 0 ? (
                    <Tr><Td colSpan={activeKeys.length + 2} className="text-center text-[#8B8B9E] py-8">No students found.</Td></Tr>
                  ) : allStudents.map(s => {
                    const req = s.requirements_met ?? {};
                    const met = activeKeys.every(k => req[k]?.met !== false);
                    return (
                      <Tr key={s.user_id}>
                        <Td>
                          <b>{s.username}</b>
                          <div className="text-[11px] text-[#8B8B9E]">{s.email}</div>
                        </Td>
                        {activeKeys.map(k => (
                          <Td key={k}>{fmtReqRow(req, k)}</Td>
                        ))}
                        <Td>
                          <span className={`text-[11px] font-bold px-2 py-[3px] rounded-full ${met ? 'bg-[#E9F9EF] text-[#16A34A]' : 'bg-[#FEF3E2] text-[#B45309]'}`}>
                            {met ? 'Yes' : 'No'}
                          </span>
                        </Td>
                      </Tr>
                    );
                  })}
                </Table>
                {studentTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={() => loadStudents(studentPage - 1)} disabled={studentPage <= 1}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-[7px] bg-[#F0EAFC] text-[#7C3AED] border-none cursor-pointer disabled:opacity-40">
                      Previous
                    </button>
                    <span className="text-[12px] text-[#8B8B9E] font-semibold">
                      Page {studentPage} of {studentTotalPages}
                    </span>
                    <button onClick={() => loadStudents(studentPage + 1)} disabled={studentPage >= studentTotalPages}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-[7px] bg-[#F0EAFC] text-[#7C3AED] border-none cursor-pointer disabled:opacity-40">
                      Next
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </>
      )}

      {/* ── Modals ── */}

      {/* Resolve */}
      <Modal open={!!resolveModal} title="Resolve Report"
        onClose={() => { setResolveModal(null); setResolveNote(''); }}
        footer={<><Button onClick={() => { setResolveModal(null); setResolveNote(''); }}>Cancel</Button><Button variant="primary" onClick={handleResolve}>Confirm</Button></>}>
        {resolveModal && (
          <div className="text-[13px] text-[#8B8B9E] mb-3">
            <b className="text-[#1A1A2E]">{resolveModal.project_title}</b> — {resolveModal.reason}
          </div>
        )}
        <FormSelect label="Action" value={resolveType} onChange={e => setResolveType(e.target.value)}>
          <option value="warning">Warning</option>
          <option value="project_removed">Project Removed</option>
          <option value="user_banned">User Banned</option>
          <option value="other">Other</option>
        </FormSelect>
        <Textarea label="Note to reporter (optional)" value={resolveNote} onChange={e => setResolveNote(e.target.value)} placeholder="Describe the action taken…" />
      </Modal>

      {/* Dismiss */}
      <Modal open={!!dismissModal} title="Dismiss Report"
        onClose={() => { setDismissModal(null); setDismissNote(''); }}
        footer={<><Button onClick={() => { setDismissModal(null); setDismissNote(''); }}>Cancel</Button><Button variant="primary" onClick={handleDismiss}>Confirm</Button></>}>
        <Textarea label="Reason for dismissal" value={dismissNote} onChange={e => setDismissNote(e.target.value)} placeholder="Why is this report being dismissed?" />
      </Modal>

      {/* View resolved report */}
      <Modal open={!!viewModal} title="Report Detail" onClose={() => setViewModal(null)}
        footer={<Button onClick={() => setViewModal(null)}>Close</Button>}>
        {viewModal && (
          <div className="flex flex-col gap-0">
            {[
              ['Project',         viewModal.project_title],
              ['Priority',        viewModal.priority?.toUpperCase()],
              ['Reason',          viewModal.reason],
              ['Reporter',        viewModal.reporter_username],
              ['Status',          <StatusTag key="s" status={statusKey(viewModal.status)} />],
              ['Response Type',   viewModal.response_type?.replace(/_/g, ' ') ?? '—'],
              ['Resolved by',     viewModal.resolved_by_username ?? '—'],
              ['Reported',        fmtDate(viewModal.created_at)],
              ['Response Date',   viewModal.response_date ? fmtDate(viewModal.response_date) : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-[9px] border-b border-[#ECE9F4] last:border-b-0 text-[13px]">
                <span className="text-[#8B8B9E] font-semibold">{k}</span>
                <span className="font-semibold text-right">{v}</span>
              </div>
            ))}
            {viewModal.description && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-1.5">Description</div>
                <div className="text-[13px] text-[#1A1A2E] bg-[#F7F5FB] rounded-[9px] px-3 py-2.5">{viewModal.description}</div>
              </div>
            )}
            {viewModal.response_message && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-1.5">Admin Message</div>
                <div className="text-[13px] text-[#1A1A2E] bg-[#F0FAF0] rounded-[9px] px-3 py-2.5">{viewModal.response_message}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve promotion */}
      <Modal open={!!approveModal} title="Approve Promotion"
        onClose={() => setApproveModal(null)}
        footer={<><Button onClick={() => setApproveModal(null)}>Cancel</Button><Button variant="primary" onClick={handleApprove}>Approve</Button></>}>
        {approveModal && (
          <p className="m-0 text-[13.5px]">
            Promote <b>{approveModal.username}</b> to Mentor? They will receive a notification and onboarding form.
          </p>
        )}
      </Modal>

      {/* Reject promotion */}
      <Modal open={!!rejectModal} title="Reject Promotion"
        onClose={() => { setRejectModal(null); setRejectReason(''); }}
        footer={<><Button onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</Button><Button variant="primary" onClick={handleReject}>Confirm</Button></>}>
        <Textarea label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="Why is this promotion being rejected?" />
      </Modal>
    </div>
  );
}
