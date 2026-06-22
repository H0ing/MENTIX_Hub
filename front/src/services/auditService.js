import * as adminApi from '../api/adminApi';

export async function getAuditLogs(params = {}) {
  const { data } = await adminApi.getAuditLogs(params);
  return data; // { success, data: [], pagination }
}

export function exportAuditCsv(logs) {
  const header = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Record ID'];
  const rows   = logs.map(l => [
    l.created_at,
    l.admin_username || l.admin_id,
    l.admin_role,
    l.action_type,
    l.target_type ? `${l.target_type}#${l.target_id}` : '',
    l.id
  ]);
  const csv  = [header, ...rows]
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'audit_log.csv';
  a.click();
}
