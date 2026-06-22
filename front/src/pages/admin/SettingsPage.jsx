import { useEffect, useState } from 'react';
import { Tabs } from '../../components/shared/Tabs';
import Toggle from '../../components/shared/Toggle';
import Button from '../../components/shared/Button';
import MvpBadge from '../../components/shared/MvpBadge';
import { Input } from '../../components/shared/Input';
import { useToast } from '../../components/shared/Toast';
import * as settingsService from '../../services/settingsService';

const TABS = [
  { id: 'mentor', label: 'Mentor Requirements' },
  { id: 'system', label: 'System' },
];

export default function SettingsPage() {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab]             = useState('mentor');
  const [minProjects, setMinProjects] = useState('0');
  const [minComments, setMinComments] = useState('0');
  const [projEnabled, setProjEnabled] = useState(true);
  const [commEnabled, setCommEnabled] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const defaults = await settingsService.getMentorRequirements();
        if (alive) {
          setMinProjects(String(defaults.minProjects));
          setMinComments(String(defaults.minComments));
          setProjEnabled(defaults.minProjectsEnabled);
          setCommEnabled(defaults.minCommentsEnabled);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  async function save() {
    await settingsService.saveMentorRequirements({
      minProjects: Number(minProjects),
      minComments: Number(minComments),
      minProjectsEnabled: projEnabled,
      minCommentsEnabled: commEnabled
    });
    showToast('Settings saved');
  }
  async function discard() {
    const d = await settingsService.getMentorRequirements();
    setMinProjects(String(d.minProjects));
    setMinComments(String(d.minComments));
    setProjEnabled(d.minProjectsEnabled);
    setCommEnabled(d.minCommentsEnabled);
    showToast('Changes discarded');
  }

  if (loading) {
    return <div className="text-[13px] text-[#8B8B9E]">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">Settings</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">Configure mentor requirements and system parameters.</p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={discard}>Discard</Button>
          <Button variant="primary" onClick={save}>Save Changes</Button>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'mentor' && (
        <div className="grid grid-cols-[1.3fr_1fr] gap-5">
          <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
            <h3 className="text-[15.5px] font-bold m-0 mb-4">Qualifying Thresholds</h3>
            <Input label="Min Project Threshold" type="number" value={minProjects} onChange={e => setMinProjects(e.target.value)} />
            <Input label="Min Comment Threshold" type="number" value={minComments} onChange={e => setMinComments(e.target.value)} />
          </div>
          <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
            <h3 className="text-[15.5px] font-bold m-0 mb-4">Toggle Requirements</h3>
            <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
              <div><div className="text-[13.5px] font-semibold">Min Projects</div><div className="text-[12px] text-[#8B8B9E]">Require published project count</div></div>
              <Toggle on={projEnabled} onChange={setProjEnabled} />
            </div>
            <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
              <div><div className="text-[13.5px] font-semibold">Min Comments</div><div className="text-[12px] text-[#8B8B9E]">Require comment activity</div></div>
              <Toggle on={commEnabled} onChange={setCommEnabled} />
            </div>
            <div className="flex items-center justify-between py-3.5 opacity-55">
              <div><div className="text-[13.5px] font-semibold flex items-center">Live Preview Count <MvpBadge /></div><div className="text-[12px] text-[#8B8B9E]">Show qualifying students in real time</div></div>
              <Toggle on={false} disabled />
            </div>
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className="grid grid-cols-2 gap-5">
          {[['Max File Size for Uploads','Set a global upload size limit.'],['Maintenance Mode Toggle','Take the platform offline for maintenance.']].map(([t,s]) => (
            <div key={t} className="border-[1.5px] border-dashed border-[#ECE9F4] rounded-[14px] p-[18px] flex items-center justify-between bg-[#FBFAFD] opacity-55">
              <div><div className="text-[13.5px] font-bold flex items-center">{t} <MvpBadge /></div><div className="text-[12px] text-[#8B8B9E] mt-1">{s}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
