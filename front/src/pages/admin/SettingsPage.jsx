import { useEffect, useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import Button from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { useToast } from '../../components/shared/Toast';
import * as settingsService from '../../services/settingsService';



export default function SettingsPage() {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [minProjects, setMinProjects] = useState('0');
  const [minHearts, setMinHearts] = useState('0');
  const [minAccountAge, setMinAccountAge] = useState('0');
  const [minComments, setMinComments] = useState('0');
  const [projEnabled, setProjEnabled] = useState(true);
  const [heartsEnabled, setHeartsEnabled] = useState(true);
  const [ageEnabled, setAgeEnabled] = useState(true);
  const [commEnabled, setCommEnabled] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const defaults = await settingsService.getMentorRequirements();
        if (alive) {
          setMinProjects(String(defaults.minProjects));
          setMinHearts(String(defaults.minHearts));
          setMinAccountAge(String(defaults.minAccountAge));
          setMinComments(String(defaults.minComments));
          setProjEnabled(defaults.minProjectsEnabled);
          setHeartsEnabled(defaults.minHeartsEnabled);
          setAgeEnabled(defaults.minAccountAgeEnabled);
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
    try {
      await settingsService.saveMentorRequirements({
        minProjects: Number(minProjects),
        minHearts: Number(minHearts),
        minAccountAge: Number(minAccountAge),
        minComments: Number(minComments),
        minProjectsEnabled: projEnabled,
        minHeartsEnabled: heartsEnabled,
        minAccountAgeEnabled: ageEnabled,
        minCommentsEnabled: commEnabled
      });
      showToast('Settings saved');
    } catch {
      showToast('Failed to save settings');
    }
  }
  async function discard() {
    try {
      const d = await settingsService.getMentorRequirements();
      setMinProjects(String(d.minProjects));
      setMinHearts(String(d.minHearts));
      setMinAccountAge(String(d.minAccountAge));
      setMinComments(String(d.minComments));
      setProjEnabled(d.minProjectsEnabled);
      setHeartsEnabled(d.minHeartsEnabled);
      setAgeEnabled(d.minAccountAgeEnabled);
      setCommEnabled(d.minCommentsEnabled);
      showToast('Changes discarded');
    } catch {
      showToast('Failed to load settings');
    }
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

      <div className="grid grid-cols-[1.3fr_1fr] gap-5">
        <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
          <h3 className="text-[15.5px] font-bold m-0 mb-4">Qualifying Thresholds</h3>
          <Input label="Min Project Threshold" type="number" value={minProjects} onChange={e => setMinProjects(e.target.value)} />
          <Input label="Min Hearts Threshold" type="number" value={minHearts} onChange={e => setMinHearts(e.target.value)} />
          <Input label="Min Account Age (Days)" type="number" value={minAccountAge} onChange={e => setMinAccountAge(e.target.value)} />
          <Input label="Min Comment Threshold" type="number" value={minComments} onChange={e => setMinComments(e.target.value)} />
        </div>
        <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-[22px]">
          <h3 className="text-[15.5px] font-bold m-0 mb-4">Toggle Requirements</h3>
          <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
            <div><div className="text-[13.5px] font-semibold">Min Projects</div><div className="text-[12px] text-[#8B8B9E]">Require published project count</div></div>
            <Toggle on={projEnabled} onChange={setProjEnabled} />
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
            <div><div className="text-[13.5px] font-semibold">Min Hearts</div><div className="text-[12px] text-[#8B8B9E]">Require hearts received</div></div>
            <Toggle on={heartsEnabled} onChange={setHeartsEnabled} />
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
            <div><div className="text-[13.5px] font-semibold">Min Account Age</div><div className="text-[12px] text-[#8B8B9E]">Require minimum account age</div></div>
            <Toggle on={ageEnabled} onChange={setAgeEnabled} />
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#ECE9F4]">
            <div><div className="text-[13.5px] font-semibold">Min Comments</div><div className="text-[12px] text-[#8B8B9E]">Require comment activity</div></div>
            <Toggle on={commEnabled} onChange={setCommEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
