import { useEffect, useState } from 'react';
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

export default function BackupPage() {
  const showToast = useToast();
  const [tab, setTab]       = useState('instant');
  const [tables, setTables] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState({ frequency: 'daily', time_of_day: '00:00:00', retention_days: 30, enabled: true });
  const [selected, setSelected] = useState({});
  const [rowLimits, setRowLimits] = useState({});
  const backupType = 'Full';
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('14:00');
  const [demoRetention, setDemoRetention] = useState(30);
  const [demoRunOnce, setDemoRunOnce] = useState(true);
  const [running, setRunning]   = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [restoreModal, setRestoreModal] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [recoverable, setRecoverable] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      const [tablesRes, historyRes, scheduleRes, recoverableRes] = await Promise.all([
        settingsService.getTables(),
        backupService.getBackupHistory(),
        backupService.getBackupSchedule(),
        backupService.getRecoverableBackups()
      ]);

      if (!alive) return;

      setTables(tablesRes.data ?? []);
      setHistory(historyRes.data ?? []);
      setRecoverable(recoverableRes.data ?? []);
      if (scheduleRes.data) {
        setSchedule({
          frequency: scheduleRes.data.frequency ?? 'daily',
          time_of_day: scheduleRes.data.time_of_day ?? '00:00:00',
          retention_days: scheduleRes.data.retention_days ?? 30,
          enabled: !!scheduleRes.data.enabled
        });
        if (scheduleRes.data.custom_date) {
          setDemoDate(scheduleRes.data.custom_date);
          setDemoTime(scheduleRes.data.time_of_day?.slice(0, 5) ?? '14:00');
          setDemoRetention(scheduleRes.data.retention_days ?? 30);
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          setDemoDate(d.toISOString().split('T')[0]);
        }
      }
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
      const result = await backupService.runBackup();
      setHistory(prev => [result.data, ...prev]);
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
      await backupService.deleteBackup(id);
      const [historyRes, recoverableRes] = await Promise.all([
        backupService.getBackupHistory(),
        backupService.getRecoverableBackups()
      ]);
      setHistory(historyRes.data ?? []);
      setRecoverable(recoverableRes.data ?? []);
      setDeleteModal(null);
      showToast('Backup file deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed');
    }
  }

  async function handleSaveSchedule() {
    await backupService.saveBackupSchedule(schedule);
    showToast('Backup schedule saved');
  }

  async function handleSaveDemoSchedule() {
    await backupService.saveBackupSchedule({
      custom_date: demoDate,
      time_of_day: `${demoTime}:00`,
      retention_days: demoRetention,
      enabled: true,
      run_once: demoRunOnce
    });
    showToast('Demo schedule saved');
  }

  return (
    <div>
      <div className="mb-1.5">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Backup</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">Run instant backups, configure schedules, and review history.</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

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
                  <div className="text-[11.5px] text-[#8B8B9E] mt-0.5">{t.rows} rows · {t.size}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <label className="text-[11.5px] text-[#8B8B9E] whitespace-nowrap">Row limit:</label>
                  <input type="number" placeholder="all" disabled={!selected[t.name]} value={rowLimits[t.name] || ''} onChange={e => setRowLimits(r => ({ ...r, [t.name]: e.target.value }))} className="w-[90px] px-2 py-[5px] border border-[#ECE9F4] rounded-[7px] text-[13px] bg-white outline-none text-right focus:border-[#7C3AED] disabled:opacity-40" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 mb-4 text-[12px]">
            <span onClick={() => selectAll(true)} className="text-[#7C3AED] font-semibold cursor-pointer">Select All</span>
            <span className="text-[#8B8B9E]">·</span>
            <span onClick={() => selectAll(false)} className="text-[#7C3AED] font-semibold cursor-pointer">Deselect All</span>
          </div>
          <Button variant="primary" disabled={running} onClick={openConfirm}>{running ? 'Running...' : 'Run Backup Now'}</Button>
        </div>
      )}

      {tab === 'schedule' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
            <h3 className="text-[15.5px] font-bold m-0 mb-4">Auto Backup Schedule</h3>
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Frequency</label>
            <select
              value={schedule.frequency}
              onChange={e => setSchedule(s => ({ ...s, frequency: e.target.value }))}
              className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Time of Day</label>
            <input type="time" value={schedule.time_of_day.slice(0, 5)} onChange={e => setSchedule(s => ({ ...s, time_of_day: `${e.target.value}:00` }))} className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Retention Days</label>
            <input type="number" value={schedule.retention_days} onChange={e => setSchedule(s => ({ ...s, retention_days: Number(e.target.value) }))} className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
            <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
              <div><div className="text-[13.5px] font-semibold flex items-center">Enabled</div><div className="text-[12px] text-[#8B8B9E]">Turn the scheduled backup on or off.</div></div>
              <Toggle on={schedule.enabled} onChange={v => setSchedule(s => ({ ...s, enabled: v }))} />
            </div>
            <Button variant="primary" className="mt-3.5" onClick={handleSaveSchedule}>Save Schedule</Button>
          </div>

          <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
            <h3 className="text-[15.5px] font-bold m-0 mb-1">Demo / One-Time</h3>
            <p className="text-[12px] text-[#8B8B9E] m-0 mb-4">Run a single backup at a specific date and time, then automatically disable.</p>
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Date</label>
            <input type="date" value={demoDate} onChange={e => setDemoDate(e.target.value)} className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Time</label>
            <input type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)} className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Retention Days</label>
            <input type="number" value={demoRetention} onChange={e => setDemoRetention(Number(e.target.value))} className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] mb-4" />
            <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
              <div><div className="text-[13.5px] font-semibold">Run once</div><div className="text-[12px] text-[#8B8B9E]">Disable schedule after the backup runs.</div></div>
              <Toggle on={demoRunOnce} onChange={setDemoRunOnce} />
            </div>
            <Button variant="primary" className="mt-3.5" onClick={handleSaveDemoSchedule}>Save Demo Schedule</Button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <Table columns={['Date', 'Size', 'Status', 'Actions']}>
          {history.map(b => (
            <Tr key={b.id}>
              <Td>{b.created_at ?? b.date}</Td>
              <Td>{b.size_bytes ? `${(b.size_bytes / 1024 / 1024).toFixed(2)} MB` : (b.size ?? '—')}</Td>
              <Td><StatusTag status={b.status} /></Td>
              <Td>
                <span onClick={() => setDeleteModal(b.id)} className="text-[#E0245E] font-semibold text-[12.5px] cursor-pointer">Delete</span>
              </Td>
            </Tr>
          ))}
        </Table>
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
            <Table columns={['Date', 'Size', 'Type', 'Actions']}>
              {recoverable.map(b => (
                <Tr key={b.id}>
                  <Td>{b.created_at ?? b.date}</Td>
                  <Td>{b.size_bytes ? `${(b.size_bytes / 1024 / 1024).toFixed(2)} MB` : '—'}</Td>
                  <Td><span className="text-[12px] font-semibold capitalize">{b.backup_type}</span></Td>
                  <Td>
                    <span onClick={() => setRestoreModal(b.id)} className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer">Restore</span>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </div>
      )}

      <Modal open={confirmModal} title="Confirm Backup" onClose={() => setConfirmModal(false)}
        footer={<><Button onClick={() => setConfirmModal(false)}>Cancel</Button><Button variant="primary" onClick={runBackup}>Confirm</Button></>}>
        {selectedTables.map(t => <div key={t.name} className="flex justify-between py-[9px] border-b border-[#ECE9F4] text-[12px]"><span className="text-[#8B8B9E] font-semibold">Table</span><span className="font-semibold">{t.name}{rowLimits[t.name] ? ` (max ${rowLimits[t.name]} rows)` : ' (all rows)'}</span></div>)}
        <div className="flex justify-between py-[9px] text-[12px]"><span className="text-[#8B8B9E] font-semibold">Type</span><span className="font-semibold">{backupType}</span></div>
      </Modal>
      <Modal open={!!deleteModal} title="Delete this backup file?" onClose={() => setDeleteModal(null)}
        footer={<><Button onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDeleteBackup(deleteModal)}>Delete</Button></>} />
      <Modal open={!!restoreModal} title="Restore from this backup?" onClose={() => { if (!restoring) setRestoreModal(null); }}
        footer={<><Button onClick={() => setRestoreModal(null)} disabled={restoring}>Cancel</Button><Button variant="primary" onClick={() => handleRestoreBackup(restoreModal)} disabled={restoring}>{restoring ? 'Restoring...' : 'Restore'}</Button></>}>
        <p className="m-0">{restoring ? 'Restoring database, please wait...' : 'Current data will be overwritten.'}</p>
      </Modal>
    </div>
  );
}
