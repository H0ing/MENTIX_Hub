import { useEffect, useState } from 'react';
import Table, { Tr, Td } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import { useToast } from '../../components/shared/Toast';
import * as auditService from '../../services/auditService';

export default function AuditLogsPage() {
  const showToast = useToast();
  const [from, setFrom] = useState('2023-10-20');
  const [to, setTo]     = useState('2023-10-27');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await auditService.getAuditLogs({ start_date: from, end_date: to });
        if (alive) {
          setLogs(res.data ?? []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [from, to]);

  const roleBadge = r => {
    const map = { super_admin: 'SUPER', moderator: 'MOD', dev_admin: 'DEV' };
    return <span className="text-[9.5px] font-bold bg-[#F0EAFC] text-[#7C3AED] px-1.5 py-[2px] rounded-md ml-1">{map[r] ?? r}</span>;
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Audit Logs</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">Track all administrative actions across the platform.</p>
        </div>
        <Button onClick={() => { auditService.exportAuditCsv(logs); showToast('Audit log exported as CSV'); }}>Export CSV</Button>
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-3 py-[9px] border border-[#ECE9F4] rounded-[9px] text-[13px] bg-white outline-none focus:border-[#7C3AED]" />
        <span className="text-[#8B8B9E]">to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="px-3 py-[9px] border border-[#ECE9F4] rounded-[9px] text-[13px] bg-white outline-none focus:border-[#7C3AED]" />
      </div>

      <div className="bg-[#F0EAFC] rounded-[14px] px-[18px] py-3.5 mb-[18px]">
        <span className="text-[#7C3AED] font-semibold text-[13px]">Moderators see own logs only. Full history is restricted to Super Admin.</span>
      </div>

      <Table columns={['Timestamp', 'Actor', 'Action', 'Record ID']}>
        {loading ? (
          <Tr><Td colSpan={4} className="text-center text-[#8B8B9E]">Loading...</Td></Tr>
        ) : logs.map(l => (
          <Tr key={l.id}>
            <Td>{l.timestamp}</Td>
            <Td>{l.actor}{roleBadge(l.actorRole)}</Td>
            <Td>{l.action}</Td>
            <Td>{l.recordId}</Td>
          </Tr>
        ))}
      </Table>
    </div>
  );
}
