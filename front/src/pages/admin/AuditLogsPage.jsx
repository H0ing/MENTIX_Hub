import { useEffect, useState, useCallback } from 'react';
import Table, { Tr, Td } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { useToast } from '../../components/shared/Toast';
import * as auditService from '../../services/auditService';

const ROLE_BADGE = { super_admin: 'SUPER', moderator: 'MOD', dev_admin: 'DEV' };

export default function AuditLogsPage() {
  const showToast = useToast();

  // Default to last 30 days
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom]       = useState(monthAgo);
  const [to, setTo]           = useState(today);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await auditService.getAuditLogs({ start_date: from, end_date: to, limit: 100 });
      // Backend returns { success, data: [...rows], pagination }
      setLogs(res.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Audit Logs</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">Track all administrative actions across the platform.</p>
        </div>
        <Button onClick={() => { auditService.exportAuditCsv(logs); showToast('Audit log exported as CSV'); }}>
          Export CSV
        </Button>
      </div>

      {/* Date filter */}
      <div className="flex gap-2 items-center mb-4">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="px-3 py-[9px] border border-[#ECE9F4] rounded-[9px] text-[13px] bg-white outline-none focus:border-[#7C3AED]" />
        <span className="text-[#8B8B9E]">to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="px-3 py-[9px] border border-[#ECE9F4] rounded-[9px] text-[13px] bg-white outline-none focus:border-[#7C3AED]" />
      </div>

      <div className="bg-[#F0EAFC] rounded-[14px] px-[18px] py-3.5 mb-[18px]">
        <span className="text-[#7C3AED] font-semibold text-[13px]">
          Moderators see own logs only. Full history is restricted to Super Admin.
        </span>
      </div>

      {error && (
        <p className="text-[#E0245E] text-[13px] mb-4">{error}</p>
      )}

      {loading ? <Loading /> : (
        <Table columns={['Timestamp', 'Actor', 'Action', 'Target', 'Record ID']}>
          {logs.length === 0 ? (
            <Tr>
              <Td colSpan={5} className="text-center text-[#8B8B9E] py-8">
                No audit logs found for this date range.
              </Td>
            </Tr>
          ) : logs.map(l => (
            <Tr key={l.id}>
              {/* Backend fields: created_at, admin_username, admin_role, action_type, target_type, target_id, id */}
              <Td className="whitespace-nowrap">{formatDate(l.created_at)}</Td>
              <Td>
                {l.admin_username || `User #${l.admin_id}`}
                {l.admin_role && (
                  <span className="text-[9.5px] font-bold bg-[#F0EAFC] text-[#7C3AED] px-1.5 py-[2px] rounded-md ml-1">
                    {ROLE_BADGE[l.admin_role] ?? l.admin_role}
                  </span>
                )}
              </Td>
              <Td>{l.action_type}</Td>
              <Td>{l.target_type ? `${l.target_type}${l.target_id ? ` #${l.target_id}` : ''}` : '—'}</Td>
              <Td className="text-[#8B8B9E] text-[12px]">#{l.id}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}
