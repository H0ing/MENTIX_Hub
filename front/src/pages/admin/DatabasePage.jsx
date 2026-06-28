import { useEffect, useState } from 'react';
import { Tabs } from '../../components/shared/Tabs';
import Table, { Tr, Td } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import { useToast } from '../../components/shared/Toast';
import * as settingsService from '../../services/settingsService';

const TABS = [
  { id: 'health', label: 'Health' },
  { id: 'opt',    label: 'Optimization' },
  { id: 'query',  label: 'Query Tool' },
];

export default function DatabasePage() {
  const showToast  = useToast();
  const [tab, setTab]       = useState('health');
  const [db, setDb]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables]   = useState([]);
  const [optSelected, setOptSelected] = useState({});
  const [sql, setSql]       = useState('');
  const [sqlError, setSqlError]   = useState('');
  const [sqlResult, setSqlResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      const [statsRes, tablesRes] = await Promise.all([
        settingsService.getDatabaseStats(),
        settingsService.getTables()
      ]);
      if (!alive) return;
      setDb(statsRes.data ?? null);
      setTables(tablesRes.data ?? []);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  function toggleOptTable(name) { setOptSelected(s => ({ ...s, [name]: !s[name] })); }

  async function runOptimize() {
    const selected = tables.filter(t => optSelected[t.name]).map(t => t.name);
    if (selected.length === 0) { showToast('Select at least one table'); return; }
    setOptimizing(true);
    try {
      await settingsService.runOptimization(selected);
      showToast('Optimization complete — tables rebuilt');
    } catch (e) {
      showToast(e.message);
    }
    setOptimizing(false);
  }

  async function runQuery() {
    setSqlError('');
    setSqlResult(null);
    try {
      const result = await settingsService.runQuery(sql);
      setSqlResult(result);
      showToast(`Query executed — ${result.data.rows.length} rows returned`);
    } catch (e) {
      setSqlError(e.message);
    }
  }

  return (
    <div>
      <div className="mb-1.5">
        <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Database</h2>
        <p className="m-0 text-[#8B8B9E] text-[13.5px]">Monitor health, run optimizations, and query the database.</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'health' && (
        loading ? <div className="text-[13px] text-[#8B8B9E]">Loading database health...</div> : (
          <div className="grid grid-cols-2 gap-[18px]">
            <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
              <div className="text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Database</div>
              <div className="text-[18px] font-black">{db?.database?.status ?? 'unknown'}</div>
              <div className="text-[12px] text-[#8B8B9E] mt-1">Latency: {db?.database?.latency_ms ?? '—'} ms</div>
              <div className="text-[12px] text-[#8B8B9E] mt-1">Timestamp: {db?.timestamp ?? '—'}</div>
            </div>
            <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
              <div className="text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2">Server</div>
              <div className="text-[18px] font-black">Uptime {Math.floor((db?.server?.uptime ?? 0) / 3600)}h</div>
              <div className="text-[12px] text-[#8B8B9E] mt-1">Node: {db?.server?.node_version ?? '—'}</div>
              <div className="text-[12px] text-[#8B8B9E] mt-1">Memory RSS: {db?.server?.memory_usage?.rss ? `${Math.round(db.server.memory_usage.rss / 1024 / 1024)} MB` : '—'}</div>
            </div>
          </div>
        )
      )}

      {tab === 'opt' && (
        <>
          <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px] mb-[18px]">
            <h3 className="text-[15.5px] font-bold m-0 mb-4">Run OPTIMIZE TABLE</h3>
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">Select Tables</label>
            <div className="flex flex-col gap-2 mb-4 max-h-[200px] overflow-y-auto">
              {tables.map(t => (
                <div key={t.name} onClick={() => toggleOptTable(t.name)} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[9px] border cursor-pointer transition-colors ${optSelected[t.name] ? 'border-[#7C3AED] bg-[#F7F5FF]' : 'border-[#ECE9F4] bg-[#F7F5FB]'}`}>
                  <input type="checkbox" readOnly checked={!!optSelected[t.name]} className="accent-[#7C3AED] w-[15px] h-[15px] flex-shrink-0" onClick={e => e.stopPropagation()} onChange={() => toggleOptTable(t.name)} />
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[13px] font-bold">{t.name}</span>
                    <span className="text-[11.5px] text-[#8B8B9E]">{t.rows} rows · {t.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" disabled={optimizing} onClick={runOptimize}>{optimizing ? 'Optimizing...' : 'Run Optimization'}</Button>
          </div>
        </>
      )}

      {tab === 'query' && (
        <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
          <h3 className="text-[15.5px] font-bold m-0 mb-4">Read-Only SQL Runner</h3>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            placeholder="SELECT * FROM projects LIMIT 10;"
            className="w-full h-[120px] font-mono text-[13px] px-3 py-3 border border-[#ECE9F4] rounded-[9px] bg-[#F7F5FB] outline-none focus:border-[#7C3AED] resize-none"
          />
          {sqlError && <div className="text-[#E0245E] text-[12.5px] font-semibold mt-2">{sqlError}</div>}
          <div className="flex justify-between items-center mt-3">
            <span className="text-[9.5px] font-bold bg-[#F0EAFC] text-[#7C3AED] px-2 py-1 rounded-md">SELECT only — write queries are blocked</span>
            <Button variant="primary" onClick={runQuery}>Run Query</Button>
          </div>
          {sqlResult && (
            <div className="mt-4 overflow-x-auto">
              <Table columns={sqlResult.data.columns}>
                {sqlResult.data.rows.map((row, i) => (
                  <Tr key={i}>{row.map((cell, j) => <Td key={j}>{cell}</Td>)}</Tr>
                ))}
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
