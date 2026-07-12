import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { Tabs } from '../../components/shared/Tabs';
import Table, { Tr, Td } from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import StatusTag from '../../components/shared/StatusTag';
import Toggle from '../../components/shared/Toggle';
import { useToast } from '../../components/shared/Toast';
import * as backupService from '../../services/backupService';
import * as settingsService from '../../services/settingsService';

const TABS = [
  { id: 'instant',  label: 'Instant Backup' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'history',  label: 'History' },
  { id: 'recovery', label: 'Recovery' },
];

const SCHEDULE_SUB_TABS = [
  { id: 'create', label: 'Create' },
  { id: 'active', label: 'Active' },
];

function toDateStr(d) {
  if (d instanceof Date) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  if (d && typeof d === 'object' && d._isAMomentObject) {
    return d.format('YYYY-MM-DD');
  }
  return String(d).split('T')[0].split(' ')[0];
}

function toTimeStr(t) {
  if (t instanceof Date) {
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
  }
  if (t && typeof t === 'object' && t._isAMomentObject) {
    return t.format('HH:mm:ss');
  }
  const s = String(t);
  if (s.length <= 10) return s;
  const mt = s.split('T')[1];
  if (mt) return mt.split('.')[0];
  const sp = s.split(' ');
  return sp[4] || sp[1] || s;
}

function localTZ() {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const m = String(Math.abs(offset) % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

function parseLocal(datePart, timePart) {
  return new Date(`${datePart}T${timePart}${localTZ()}`);
}

function scheduleStatus(s) {
  if (!s) return 'Inactive';
  if (s.frequency === 'one_time' && s.custom_date) {
    const datePart = toDateStr(s.custom_date);
    const timePart = toTimeStr(s.time_of_day);
    const scheduled = parseLocal(datePart, timePart);
    const now = new Date();
    if (!isNaN(scheduled.getTime()) && scheduled.getTime() > now.getTime()) return 'Pending';
    if (s.last_run) return 'Completed';
    return 'Missed';
  }
  if (['daily', 'weekly'].includes(s.frequency)) return s.enabled ? 'Active' : 'Disabled';
  return 'Inactive';
}

function ScheduleCard({ s, onDelete, onToggle }) {
  const st = scheduleStatus(s);
  const colorMap = {
    Disabled: '#8B8B9E',
    Inactive: '#8B8B9E',
    Pending: '#7C3AED',
    Active: '#7C3AED',
    Completed: '#22C55E',
    Missed: '#E0245E',
    Failed: '#E0245E',
  };
  const borderColor = colorMap[st] || '#8B8B9E';

  const datePart = s.frequency === 'one_time' && s.custom_date ? toDateStr(s.custom_date) : null;
  const timePart = s.time_of_day ? toTimeStr(s.time_of_day) : null;
  const scheduledDebug = datePart && timePart ? parseLocal(datePart, timePart).toLocaleString() : null;
  const rawCustomDate = s.custom_date ? String(s.custom_date) : null;
  const isDateObj = s.custom_date instanceof Date;

  return (
    <div className="border rounded-[10px] p-4" style={{ borderColor }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[14px] font-bold capitalize">{s.frequency === 'one_time' ? '1 Time' : s.frequency}</span>
          <span className="ml-2"><StatusTag status={st} /></span>
        </div>
        <div className="flex items-center gap-3">
          {['daily', 'weekly'].includes(s.frequency) && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#8B8B9E]">Off / On</span>
              <Toggle on={s.enabled} onChange={() => onToggle(s.id, !s.enabled)} />
            </div>
          )}
          <button onClick={() => onDelete(s.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#E0245E] bg-red-50 rounded-[6px] cursor-pointer border-none hover:bg-red-100 transition-colors">
            <FiTrash2 size={12} /> Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <div><span className="text-[#8B8B9E]">Time</span><br /><span className="font-semibold">{s.time_of_day?.slice(0, 5)}</span></div>
        {s.custom_date && (
          <div><span className="text-[#8B8B9E]">Date</span><br /><span className="font-semibold">{new Date(s.custom_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span></div>
        )}
        <div><span className="text-[#8B8B9E]">Retention</span><br /><span className="font-semibold">{s.retention_days}d</span></div>
        <div><span className="text-[#8B8B9E]">Format</span><br /><span className="font-semibold uppercase">{s.backup_format || 'sql'}</span></div>
      </div>
      {scheduledDebug && (
        <div className="mt-2 text-[11px] text-[#8B8B9E] border-t border-[#ECE9F4] pt-2">
          Raw: {rawCustomDate} ({isDateObj ? 'Date obj' : 'string'}) &rarr; datePart: {datePart} &rarr; Scheduled: {scheduledDebug}
          {st === 'Missed' && <span className="ml-2 text-[#E0245E]">(now: {new Date().toLocaleString()})</span>}
        </div>
      )}
    </div>
  );
}

export default function BackupPage() {
  const showToast = useToast();
  const [tab, setTab]       = useState('instant');
  const [schedSub, setSchedSub] = useState('create');
  const [tables, setTables] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selected, setSelected] = useState({});
  const [rowLimits, setRowLimits] = useState({});
  const [backupFormat, setBackupFormat] = useState('sql');
  const [running, setRunning]   = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [restoreModal, setRestoreModal] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [recoverable, setRecoverable] = useState([]);
  const LIMIT = 10;
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [recoveryPage, setRecoveryPage] = useState(1);
  const [recoveryTotal, setRecoveryTotal] = useState(0);

  const [cFreq, setCFreq] = useState('daily');
  const [cDate, setCDate] = useState('');
  const [cTime, setCTime] = useState('14:00');
  const [cRetention, setCRetention] = useState(30);

  useEffect(() => {
    let alive = true;

    async function load() {
      const [tablesRes, historyRes, schedulesRes, recoverableRes] = await Promise.all([
        settingsService.getTables(),
        backupService.getBackupHistory({ page: 1, limit: 10 }),
        backupService.getSchedules(),
        backupService.getRecoverableBackups({ page: 1, limit: 10 })
      ]);

      if (!alive) return;

      setTables(tablesRes.data ?? []);
      setHistory(historyRes.data ?? []);
      setHistoryTotal(historyRes.pagination?.totalItems ?? 0);
      setSchedules(schedulesRes.data ?? []);
      setRecoverable(recoverableRes.data ?? []);
      setRecoveryTotal(recoverableRes.pagination?.totalItems ?? 0);
    }

    load();
    return () => { alive = false; };
  }, []);

  function toggleTable(name) { setSelected(s => ({ ...s, [name]: !s[name] })); }
  function selectAll(v) { const s = {}; tables.forEach(t => { s[t.name] = v; }); setSelected(s); }
  const selectedTables = tables.filter(t => selected[t.name]);

  function openConfirm() {
    if (selectedTables.length === 0) { showToast('Select at least one table'); return; }
    setConfirmModal(true);
  }

  async function runBackup() {
    setConfirmModal(false);
    setRunning(true);
    try {
      const payload = { backup_format: backupFormat };
      if (Object.keys(selected).length > 0) {
        payload.selected_tables = Object.keys(selected).filter(k => selected[k]);
        if (Object.keys(rowLimits).length > 0) {
          payload.row_limits = rowLimits;
        }
      }
      const result = await backupService.runBackup(payload);
      if (result.data?.backups) {
        const allHistory = await backupService.getBackupHistory({ page: 1, limit: LIMIT });
        setHistory(allHistory.data ?? []);
        setHistoryTotal(allHistory.pagination?.totalItems ?? 0);
        setHistoryPage(1);
      } else {
        setHistory(prev => [result.data, ...prev]);
      }
      setSelected({});
      setRowLimits({});
      setRunning(false);
      setTab('history');
      showToast('Backup completed successfully');
    } catch (err) {
      setRunning(false);
      showToast(err.response?.data?.message || 'Backup failed');
    }
  }

  async function handleRestoreBackup(id) {
    setRestoring(true);
    try {
      await backupService.restoreBackup(id);
      setRestoreModal(null);
      showToast('Restore completed');
    } catch (err) {
      showToast(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(false);
    }
  }

  async function handleDeleteBackup(id) {
    try {
      await backupService.deleteBackupById(id);
      const [historyRes, recoverableRes] = await Promise.all([
        backupService.getBackupHistory({ page: historyPage, limit: LIMIT }),
        backupService.getRecoverableBackups({ page: recoveryPage, limit: LIMIT })
      ]);
      setHistory(historyRes.data ?? []);
      setHistoryTotal(historyRes.pagination?.totalItems ?? 0);
      setRecoverable(recoverableRes.data ?? []);
      setRecoveryTotal(recoverableRes.pagination?.totalItems ?? 0);
      setDeleteModal(null);
      showToast('Backup file deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed');
    }
  }

  async function handleCreateSchedule() {
    const payload = {
      frequency: cFreq,
      time_of_day: `${cTime}:00`,
      retention_days: cRetention,
    };
    if (cFreq === 'one_time') {
      payload.custom_date = cDate;
      payload.run_once = true;
    } else {
      payload.run_once = false;
    }
    try {
      const res = await backupService.createSchedule(payload);
      if (res.data) setSchedules(prev => [...prev, res.data]);
      showToast('Schedule created');
      setSchedSub('active');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create schedule');
    }
  }

  async function handleDeleteSchedule(id) {
    try {
      await backupService.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setDeleteModal(null);
      showToast('Schedule deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete schedule');
    }
  }

  async function handleToggleSchedule(id, enabled) {
    try {
      await backupService.updateSchedule(id, { enabled });
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update schedule');
    }
  }

  async function loadHistoryPage(page) {
    const res = await backupService.getBackupHistory({ page, limit: LIMIT });
    setHistory(res.data ?? []);
    setHistoryTotal(res.pagination?.totalItems ?? 0);
    setHistoryPage(page);
  }

  async function loadRecoveryPage(page) {
    const res = await backupService.getRecoverableBackups({ page, limit: LIMIT });
    setRecoverable(res.data ?? []);
    setRecoveryTotal(res.pagination?.totalItems ?? 0);
    setRecoveryPage(page);
  }

  const isOneTimePast = cFreq === 'one_time' && cDate && cTime && new Date(`${cDate}T${cTime}`) <= new Date();
  const [scheduleDeleteId, setScheduleDeleteId] = useState(null);

  function handleFreqChange(freq) {
    setCFreq(freq);
    if (freq === 'one_time' && !cDate) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setCDate(d.toISOString().split('T')[0]);
    }
  }

  return (
    <div>
      <div className="mb-1.5">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Backup</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">Create schedules, view active backups, and review history.</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={t => { setTab(t); if (t === 'schedule') setSchedSub('create'); }} />

      {tab === 'instant' && (
        <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
          <h3 className="text-[15.5px] font-bold m-0 mb-4">Run Backup Now</h3>
          <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Tables to Backup</label>
          <p className="text-[12px] text-[#8B8B9E] mb-2.5">Select one or more tables. Optionally set a row limit to backup only the most recent N rows.</p>
          <div className="flex flex-col gap-2 mb-2.5">
            {tables.map(t => (
              <div key={t.name} onClick={() => toggleTable(t.name)} className={`flex items-center gap-3 px-3.5 py-3 rounded-[9px] border cursor-pointer transition-colors ${selected[t.name] ? 'border-[#7C3AED] bg-[#F7F5FF]' : 'border-[#ECE9F4] bg-[#F7F5FB]'}`}>
                <input type="checkbox" readOnly checked={!!selected[t.name]} className="accent-[#7C3AED] w-[15px] h-[15px] flex-shrink-0" onClick={e => e.stopPropagation()} onChange={() => toggleTable(t.name)} />
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{t.name}</div>
                  <div className="text-[11.5px] text-[#8B8B9E] mt-0.5">{t.rows} rows &middot; {t.size}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <label className="text-[11.5px] text-[#8B8B9E] whitespace-nowrap">Row limit:</label>
                  <input type="number" min="0" placeholder="all" disabled={!selected[t.name]} value={rowLimits[t.name] || ''} onChange={e => setRowLimits(r => ({ ...r, [t.name]: e.target.value }))} className="w-[90px] px-2 py-[5px] border border-[#ECE9F4] rounded-[7px] text-[13px] bg-white outline-none text-right focus:border-[#7C3AED] disabled:opacity-40" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 mb-4 text-[12px]">
            <span onClick={() => selectAll(true)} className="text-[#7C3AED] font-semibold cursor-pointer">Select All</span>
            <span className="text-[#8B8B9E]">&middot;</span>
            <span onClick={() => selectAll(false)} className="text-[#7C3AED] font-semibold cursor-pointer">Deselect All</span>
          </div>
          {selectedTables.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <label className="text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em]">Format:</label>
              <div className="flex bg-[#F7F5FB] rounded-[9px] p-[3px] border border-[#ECE9F4]">
                <button onClick={() => setBackupFormat('sql')} className={`px-3 py-[5px] text-[12px] font-semibold rounded-[7px] cursor-pointer border-none transition-colors ${backupFormat === 'sql' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-[#8B8B9E] bg-transparent'}`}>.sql</button>
                <button onClick={() => setBackupFormat('csv')} className={`px-3 py-[5px] text-[12px] font-semibold rounded-[7px] cursor-pointer border-none transition-colors ${backupFormat === 'csv' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-[#8B8B9E] bg-transparent'}`}>.csv</button>
              </div>
              <span className="text-[11px] text-[#8B8B9E]">{backupFormat === 'csv' ? 'One file per table' : 'Single file'}</span>
            </div>
          )}
          <Button variant="primary" disabled={running} onClick={openConfirm}>{running ? 'Running...' : 'Run Backup Now'}</Button>
        </div>
      )}

      {tab === 'schedule' && (
        <div>
          <div className="flex gap-1 mb-4 bg-[#F7F5FB] rounded-[9px] p-[3px] border border-[#ECE9F4] w-fit">
            {SCHEDULE_SUB_TABS.map(st => (
              <button key={st.id} onClick={() => setSchedSub(st.id)}
                className={`px-4 py-[6px] text-[12px] font-semibold rounded-[7px] cursor-pointer border-none transition-colors ${schedSub === st.id ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-[#8B8B9E] bg-transparent'}`}>{st.label}</button>
            ))}
          </div>

          {schedSub === 'create' && (
            <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
              <h3 className="text-[15.5px] font-bold m-0 mb-4">Create Schedule</h3>

              <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Frequency</label>
              <select value={cFreq} onChange={e => handleFreqChange(e.target.value)}
                className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4">
                <option value="one_time">1 Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>

              {cFreq === 'one_time' && (
                <>
                  <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Date</label>
                  <input type="date" value={cDate} onChange={e => setCDate(e.target.value)}
                    className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
                  {isOneTimePast && (
                    <p className="text-[12px] text-[#E0245E] font-semibold mt-[-12px] mb-4">Selected date and time are in the past &mdash; the backup will not run.</p>
                  )}
                </>
              )}

              <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Time (24h format, e.g. 17:30 for 5:30PM)</label>
              <input type="time" value={cTime} onChange={e => setCTime(e.target.value)}
                className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />

              <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Retention Days</label>
              <input type="number" value={cRetention} onChange={e => setCRetention(Number(e.target.value))}
                className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />

              <Button variant="primary" onClick={handleCreateSchedule}>Create Schedule</Button>
            </div>
          )}

          {schedSub === 'active' && (
            <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
              <h3 className="text-[15.5px] font-bold m-0 mb-4">Active Schedules</h3>

              {schedules.length === 0 ? (
                <p className="text-[13.5px] text-[#8B8B9E] m-0">No schedules yet. Go to the Create tab to set one up.</p>
              ) : (
                <div>
                  <h4 className="text-[13px] font-bold mb-3">All Schedules</h4>
                  <div className="flex flex-col gap-3">
                    {schedules.map(s => (
                      <ScheduleCard key={s.id} s={s} onDelete={id => { setScheduleDeleteId(id); setDeleteModal('schedule'); }} onToggle={handleToggleSchedule} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          <Table columns={['Date', 'Size', 'Type', 'Format', 'Status', 'Actions']}>
            {history.map(b => {
              const fmt = b.file_path?.endsWith('.csv') ? 'csv' : b.file_path?.endsWith('.sql') ? 'sql' : '\u2014';
              return (
                <Tr key={b.id}>
                  <Td>{b.created_at ?? b.date}</Td>
                  <Td>{b.size_bytes ? `${(b.size_bytes / 1024 / 1024).toFixed(2)} MB` : (b.size ?? '\u2014')}</Td>
                  <Td><span className="text-[12px] font-semibold capitalize">{b.backup_type || '\u2014'}</span></Td>
                  <Td><span className="text-[12px] font-mono font-semibold uppercase">{fmt}</span></Td>
                  <Td><StatusTag status={b.status} /></Td>
                  <Td>
                    <span onClick={() => setDeleteModal(b.id)} className="text-[#E0245E] font-semibold text-[12.5px] cursor-pointer">Delete</span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
          {Math.ceil(historyTotal / LIMIT) > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => loadHistoryPage(historyPage - 1)} disabled={historyPage <= 1} className="flex items-center gap-1 px-3 py-[6px] text-[12px] font-semibold rounded-[8px] border border-[#ECE9F4] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F5FB] transition-colors"><FiChevronLeft size={14} /> Previous</button>
              <span className="text-[12px] text-[#8B8B9E] font-semibold">Page {historyPage} of {Math.ceil(historyTotal / LIMIT)}</span>
              <button onClick={() => loadHistoryPage(historyPage + 1)} disabled={historyPage >= Math.ceil(historyTotal / LIMIT)} className="flex items-center gap-1 px-3 py-[6px] text-[12px] font-semibold rounded-[8px] border border-[#ECE9F4] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F5FB] transition-colors">Next <FiChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {tab === 'recovery' && (
        <div>
          <div className="mb-4">
            <h3 className="text-[15.5px] font-bold m-0 mb-1">Recover from Backup</h3>
            <p className="text-[12px] text-[#8B8B9E] m-0">Only backups with files still on disk are shown. Select one to restore your data.</p>
          </div>
          {recoverable.length === 0 ? (
            <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px] text-center">
              <p className="text-[13.5px] text-[#8B8B9E] m-0">No recoverable backups found.</p>
            </div>
          ) : (
            <div>
              <Table columns={['Date', 'Size', 'Type', 'Format', 'Actions']}>
                {recoverable.map(b => {
                  const fmt = b.file_path?.endsWith('.csv') ? 'csv' : b.file_path?.endsWith('.sql') ? 'sql' : '\u2014';
                  return (
                    <Tr key={b.id}>
                      <Td>{b.created_at ?? b.date}</Td>
                      <Td>{b.size_bytes ? `${(b.size_bytes / 1024 / 1024).toFixed(2)} MB` : '\u2014'}</Td>
                      <Td><span className="text-[12px] font-semibold capitalize">{b.backup_type}</span></Td>
                      <Td><span className="text-[12px] font-mono font-semibold uppercase">{fmt}</span></Td>
                      <Td>
                        <span onClick={() => setRestoreModal(b.id)} className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer">Restore</span>
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
              {Math.ceil(recoveryTotal / LIMIT) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => loadRecoveryPage(recoveryPage - 1)} disabled={recoveryPage <= 1} className="flex items-center gap-1 px-3 py-[6px] text-[12px] font-semibold rounded-[8px] border border-[#ECE9F4] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F5FB] transition-colors"><FiChevronLeft size={14} /> Previous</button>
                  <span className="text-[12px] text-[#8B8B9E] font-semibold">Page {recoveryPage} of {Math.ceil(recoveryTotal / LIMIT)}</span>
                  <button onClick={() => loadRecoveryPage(recoveryPage + 1)} disabled={recoveryPage >= Math.ceil(recoveryTotal / LIMIT)} className="flex items-center gap-1 px-3 py-[6px] text-[12px] font-semibold rounded-[8px] border border-[#ECE9F4] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F5FB] transition-colors">Next <FiChevronRight size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={confirmModal} title="Confirm Backup" onClose={() => setConfirmModal(false)}
        footer={<><Button onClick={() => setConfirmModal(false)}>Cancel</Button><Button variant="primary" onClick={runBackup}>Confirm</Button></>}>
        {selectedTables.map(t => <div key={t.name} className="flex justify-between py-[9px] border-b border-[#ECE9F4] text-[12px]"><span className="text-[#8B8B9E] font-semibold">Table</span><span className="font-semibold">{t.name}{rowLimits[t.name] ? ` (max ${rowLimits[t.name]} rows)` : ' (all rows)'}</span></div>)}
        <div className="flex justify-between py-[9px] text-[12px]"><span className="text-[#8B8B9E] font-semibold">Type</span><span className="font-semibold">Full</span></div>
        <div className="flex justify-between py-[9px] text-[12px]"><span className="text-[#8B8B9E] font-semibold">Format</span><span className="font-semibold uppercase">{backupFormat}{backupFormat === 'csv' ? ` (${selectedTables.length} file(s))` : ''}</span></div>
      </Modal>
      <Modal open={deleteModal === 'schedule'} title="Delete this schedule?" onClose={() => setDeleteModal(null)}
        footer={<><Button onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (scheduleDeleteId) handleDeleteSchedule(scheduleDeleteId); }}>Delete</Button></>}>
        <p className="m-0 text-[13px] text-[#8B8B9E]">The schedule will be removed and no future backups will run.</p>
      </Modal>
      <Modal open={!!deleteModal && deleteModal !== 'schedule'} title="Delete this backup file?" onClose={() => setDeleteModal(null)}
        footer={<><Button onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDeleteBackup(deleteModal)}>Delete</Button></>} />
      <Modal open={!!restoreModal} title="Restore from this backup?" onClose={() => { if (!restoring) setRestoreModal(null); }}
        footer={<><Button onClick={() => setRestoreModal(null)} disabled={restoring}>Cancel</Button><Button variant="primary" onClick={() => handleRestoreBackup(restoreModal)} disabled={restoring}>{restoring ? 'Restoring...' : 'Restore'}</Button></>}>
        <p className="m-0">{restoring ? 'Restoring database, please wait...' : 'Current data will be overwritten.'}</p>
      </Modal>
    </div>
  );
}
