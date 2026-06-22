import { useState, useEffect, useCallback } from 'react';
import { Tabs } from '../../components/shared/Tabs';
import Table, { Tr, Td } from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import StatusTag from '../../components/shared/StatusTag';
import Loading from '../../components/shared/Loading';
import { Textarea, Select as FormSelect } from '../../components/shared/Input';
import { useToast } from '../../components/shared/Toast';
import { getCurrentAdmin } from '../../services/authService';
import * as reportService    from '../../services/reportService';
import * as promotionService from '../../services/promotionService';

const TABS = [
  { id: 'reports', label: 'Reports' },
  { id: 'promo',   label: 'Mentor Promotion' },
  { id: 'revoke',  label: 'Revocation' },
];

const STATUS_MAP = {
  pending:      'pending',
  under_review: 'under_review',
  resolved:     'resolved',
  dismissed:    'resolved',
};

export default function ModerationPage() {
  const showToast    = useToast();
  const currentAdmin = getCurrentAdmin();
  const [tab, setTab] = useState('reports');

  // ── Reports ────────────────────────────────────────────────────────────────
  const [reports, setReports]         = useState([]);
  const [reportLoading, setRepLoad]   = useState(true);
  const [reportError, setRepError]    = useState('');
  const [reportFilter, setRepFilter]  = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [dismissModal, setDismissModal] = useState(null);
  const [resolveType, setResolveType]   = useState('warning');
  const [resolveNote, setResolveNote]   = useState('');
  const [dismissNote, setDismissNote]   = useState('');

  const loadReports = useCallback(async () => {
    setRepLoad(true); setRepError('');
    try {
      const params = reportFilter ? { status: reportFilter } : {};
      const res    = await reportService.getReports(params);
      setReports(res.data ?? []);
    } catch (e) {
      setRepError(e.response?.data?.message || 'Failed to load reports.');
    } finally { setRepLoad(false); }
  }, [reportFilter]);

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

  // ── Promotions ─────────────────────────────────────────────────────────────
  const [promotions, setPromotions]      = useState([]);
  const [promoLoading, setPromoLoad]     = useState(true);
  const [approveModal, setApproveModal]  = useState(null);
  const [rejectPromoModal, setRejectPromo] = useState(null);
  const [rejectReason, setRejectReason]  = useState('');

  const loadPromotions = useCallback(async () => {
    setPromoLoad(true);
    try {
      const res = await promotionService.getPromotionQueue();
      setPromotions(res.data ?? []);
    } catch { /* show empty */ }
    finally { setPromoLoad(false); }
  }, []);

  useEffect(() => { if (tab === 'promo') loadPromotions(); }, [tab, loadPromotions]);

  async function handleApprovePromo() {
    try {
      await promotionService.approvePromotion(approveModal.id);
      showToast('Promotion approved — mentor form sent to student');
      setApproveModal(null);
      loadPromotions();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to approve.'); }
  }

  async function handleRejectPromo() {
    try {
      await promotionService.rejectPromotion(rejectPromoModal.id, rejectReason);
      showToast('Promotion rejected — notice sent to student');
      setRejectPromo(null); setRejectReason('');
      loadPromotions();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to reject.'); }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function statusKey(s) {
    const m = { Pending: 'pending', pending: 'pending', under_review: 'under_review', 'Under Review': 'under_review', resolved: 'resolved', Resolved: 'resolved', dismissed: 'resolved' };
    return m[s] ?? 'pending';
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Moderator</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">Review reports, mentor promotions, and revocations.</p>
        </div>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Reports ── */}
      {tab === 'reports' && (
        <>
          <div className="flex gap-3 mb-[18px]">
            <select value={reportFilter} onChange={e => { setRepFilter(e.target.value); }}
              className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {reportLoading ? <Loading /> : reportError ? (
            <p className="text-[#E0245E] text-[13px]">{reportError}</p>
          ) : (
            <Table columns={['Project', 'Reason', 'Reported By', 'Resolved By', 'Status', 'Actions']}
              toolbar={<h4 className="m-0 text-[14.5px] font-bold">All Reports</h4>}>
              {reports.map(r => (
                <Tr key={r.id}>
                  <Td><b>{r.project_title}</b></Td>
                  <Td>{r.reason}</Td>
                  <Td>{r.reporter_username}</Td>
                  <Td>{r.resolved_by_username ?? <span className="text-[#B7B2C9]">—</span>}</Td>
                  <Td><StatusTag status={statusKey(r.status)} /></Td>
                  <Td>
                    <div className="flex gap-2">
                      {(r.status === 'pending' || r.status === 'under_review') ? (
                        <>
                          <button onClick={() => setResolveModal(r)} className="text-[11.5px] font-semibold px-[11px] py-[6px] rounded-[7px] bg-[#E9F9EF] text-[#16A34A] border-none cursor-pointer">Resolve</button>
                          <button onClick={() => setDismissModal(r)} className="text-[11.5px] font-semibold px-[11px] py-[6px] rounded-[7px] bg-[#FDEAF0] text-[#E0245E] border-none cursor-pointer">Dismiss</button>
                        </>
                      ) : (
                        <span className="text-[#7C3AED] font-semibold text-[12.5px]">Resolved</span>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
              {reports.length === 0 && <Tr><Td colSpan={6} className="text-center text-[#8B8B9E]">No reports found.</Td></Tr>}
            </Table>
          )}
        </>
      )}

      {/* ── Promotions ── */}
      {tab === 'promo' && (
        promoLoading ? <Loading /> :
        <Table columns={['Student', 'Projects', 'Hearts', 'Comments', 'Account Age', 'Actions']}>
          {promotions.map(p => {
            const req = p.requirements_met ?? {};
            const fmt = (key, reqVal) => {
              const val = p[key] ?? req[key]?.actual ?? '?';
              const met = req[key]?.met;
              return `${val} / ${reqVal ?? req[key]?.required ?? '?'} ${met ? '✓' : '✗'}`;
            };
            return (
              <Tr key={p.id}>
                <Td><b>{p.username}</b></Td>
                <Td>{fmt('project_count', null)}</Td>
                <Td>{fmt('total_hearts',  null)}</Td>
                <Td>{fmt('comment_count', null)}</Td>
                <Td>{fmt('account_age_days', null)}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => setApproveModal(p)} className="text-[11.5px] font-semibold px-[11px] py-[6px] rounded-[7px] bg-[#E9F9EF] text-[#16A34A] border-none cursor-pointer">Approve</button>
                    <button onClick={() => setRejectPromo(p)} className="text-[11.5px] font-semibold px-[11px] py-[6px] rounded-[7px] bg-[#FDEAF0] text-[#E0245E] border-none cursor-pointer">Reject</button>
                  </div>
                </Td>
              </Tr>
            );
          })}
          {promotions.length === 0 && <Tr><Td colSpan={6} className="text-center text-[#8B8B9E]">No pending promotions.</Td></Tr>}
        </Table>
      )}

      {/* ── Revocation (static for now) ── */}
      {tab === 'revoke' && (
        <Table columns={['Name', 'Revoked At', 'Reason']}>
          <Tr><Td><b>Liam Vance</b></Td><Td>Oct 26, 2023 · 7:30 PM</Td><Td>Inactive for 90+ days</Td></Tr>
          <Tr><Td><b>Dana Ortiz</b></Td><Td>Oct 14, 2023 · 11:05 AM</Td><Td>Repeated reported content</Td></Tr>
        </Table>
      )}

      {/* Resolve modal */}
      <Modal open={!!resolveModal} title="Resolve Report" onClose={() => setResolveModal(null)}
        footer={<><Button onClick={() => setResolveModal(null)}>Cancel</Button><Button variant="primary" onClick={handleResolve}>Confirm</Button></>}>
        <FormSelect label="Response Type" value={resolveType} onChange={e => setResolveType(e.target.value)}>
          <option value="warning">Warning</option>
          <option value="project_removed">Project removed</option>
          <option value="user_banned">User banned</option>
          <option value="other">Dismissed/other</option>
        </FormSelect>
        <Textarea label="Resolution Note" value={resolveNote} onChange={e => setResolveNote(e.target.value)} placeholder="Describe the action taken..." />
      </Modal>

      {/* Dismiss modal */}
      <Modal open={!!dismissModal} title="Dismiss Report" onClose={() => setDismissModal(null)}
        footer={<><Button onClick={() => setDismissModal(null)}>Cancel</Button><Button variant="primary" onClick={handleDismiss}>Confirm</Button></>}>
        <Textarea label="Reason" value={dismissNote} onChange={e => setDismissNote(e.target.value)} placeholder="Why is this report being dismissed?" />
      </Modal>

      {/* Approve promo modal */}
      <Modal open={!!approveModal} title="Approve Promotion" onClose={() => setApproveModal(null)}
        footer={<><Button onClick={() => setApproveModal(null)}>Cancel</Button><Button variant="primary" onClick={handleApprovePromo}>Confirm</Button></>}>
        {approveModal && <p className="m-0 text-[13.5px]">Approve <b>{approveModal.username}</b>'s promotion to Mentor?</p>}
      </Modal>

      {/* Reject promo modal */}
      <Modal open={!!rejectPromoModal} title="Reject Promotion" onClose={() => setRejectPromo(null)}
        footer={<><Button onClick={() => setRejectPromo(null)}>Cancel</Button><Button variant="primary" onClick={handleRejectPromo}>Confirm</Button></>}>
        <Textarea label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Why is this promotion being rejected?" />
      </Modal>
    </div>
  );
}
