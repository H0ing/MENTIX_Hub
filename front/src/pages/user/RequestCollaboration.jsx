import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { sendCollaborationRequest } from '../../api/collaborationApi';

const SKILL_OPTIONS = ['UI design', 'Frontend dev', 'Data analysis', 'UX research'];
const CONNECT_OPTIONS = ['Discord', 'Email', 'Line', 'Facebook', 'Either'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function RequestCollaboration() {
  const navigate = useNavigate();
  const location = useLocation();
  const receiver = location.state?.receiver;

  const [form, setForm] = useState({
    intro: '',
    projectInterested: '',
    ownProjectName: '',
    ownProjectDesc: '',
    whyCollaborate: '',
    otherSkill: '',
    preferredConnect: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [connectOption, setConnectOption] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function toggleSkill(skill) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function validate() {
    const newErrors = {};
    if (!form.intro.trim()) newErrors.intro = 'Please introduce yourself and your project.';
    if (!form.projectInterested.trim())
      newErrors.projectInterested = 'Please enter the project you are interested in.';
    if (!form.ownProjectName.trim())
      newErrors.ownProjectName = 'Please enter the name of your project.';
    if (!form.ownProjectDesc.trim())
      newErrors.ownProjectDesc = 'Please briefly describe your project.';
    if (!form.whyCollaborate.trim())
      newErrors.whyCollaborate = 'Please explain why you want to collaborate.';
    if (!connectOption) newErrors.connectOption = 'Please select a preferred way to connect.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSending(true);
    try {
      const res = await sendCollaborationRequest({
        receiver_id: receiver?.id,
        project_interest: form.projectInterested,
        benefit: `Intro: ${form.intro}\nMy project: ${form.ownProjectName} — ${form.ownProjectDesc}\nSkills: ${[...selectedSkills, form.otherSkill].filter(Boolean).join(', ')}`,
        why_needed: form.whyCollaborate,
      });
      const requestId = res.data.data.id;
      navigate('/colab-request-success', {
        state: {
          requestId,
          projectName: form.ownProjectName,
          interestedProject: form.projectInterested,
          skills: [...selectedSkills, form.otherSkill].filter(Boolean),
          connectOption: connectOption,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request. Please try again.';
      setErrors({ intro: msg });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="py-8 font-[Inter,sans-serif]">
      {/* Page header */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-[32px] text-black leading-tight">Request Collaboration</h1>
        <p className="text-[#433f3f] text-lg mt-1">
          &quot;I saw your project, I have a similar vibe — let's work together.&quot;
        </p>
      </div>

      {/* Card */}
      <div className="max-w-[640px] mx-auto bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        {receiver && (
          <div className="bg-[#f3f4f5] border border-[#ccc3d8] rounded-[12px] p-4 mb-1">
            <p className="text-[#4a4455] text-[10px] font-medium uppercase tracking-wide mb-1">Sending request to</p>
            <p className="text-[#191c1d] font-semibold text-[15px]">{receiver.full_name}</p>
          </div>
        )}

        {/* Intro */}
        <div>
          <textarea
            value={form.intro}
            onChange={(e) => update('intro', e.target.value)}
            placeholder="Introduce yourself and your project."
            rows={2}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
          />
          <FieldError message={errors.intro} />
        </div>

        {/* Project interested in */}
        <div>
          <label className="text-[#001a42] font-semibold text-[13px] block mb-1">
            Project you're interested in
          </label>
          <input
            type="text"
            value={form.projectInterested}
            onChange={(e) => update('projectInterested', e.target.value)}
            placeholder="Smart campus navigation"
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
          />
          <FieldError message={errors.projectInterested} />
        </div>

        {/* About your own project */}
        <div>
          <p className="text-[#001a42] font-semibold text-[13px] mb-2">About your own project</p>
          <label className="text-[#001a42] font-semibold text-[12px] block mb-1">
            Name of your project
          </label>
          <input
            type="text"
            value={form.ownProjectName}
            onChange={(e) => update('ownProjectName', e.target.value)}
            placeholder="e.g., AI powered Study Buddy"
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all mb-1.5"
          />
          <FieldError message={errors.ownProjectName} />
          <textarea
            value={form.ownProjectDesc}
            onChange={(e) => update('ownProjectDesc', e.target.value)}
            placeholder="Brief description of what you are working on"
            rows={3}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all mt-1.5"
          />
          <FieldError message={errors.ownProjectDesc} />
        </div>

        {/* Why collaborate */}
        <div>
          <label className="text-[#001a42] font-semibold text-[13px] block mb-1">
            Why you want to collaborate?
          </label>
          <textarea
            value={form.whyCollaborate}
            onChange={(e) => update('whyCollaborate', e.target.value)}
            placeholder="We can combine ...."
            rows={3}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
          />
          <FieldError message={errors.whyCollaborate} />
        </div>

        {/* Skills chips */}
        <div>
          <label className="text-[#001a42] font-semibold text-[13px] block mb-1.5">
            What you bring to the table
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'bg-[#630ed4] text-white border-[#630ed4]'
                    : 'bg-[#d9d9d9] text-black border-black/20 hover:border-[#630ed4]'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={form.otherSkill}
            onChange={(e) => update('otherSkill', e.target.value)}
            placeholder="Add other skill"
            className="w-full border border-black/10 rounded-[12px] px-3 py-2 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
          />
        </div>

        {/* Preferred way to connect */}
        <div>
          <label className="text-[#001a42] font-semibold text-[13px] block mb-1.5">
            Preferred way to connect
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CONNECT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setConnectOption(opt);
                  setErrors((prev) => ({ ...prev, connectOption: '' }));
                }}
                className={`px-4 py-1.5 rounded-[12px] border text-[14px] font-semibold transition-colors ${
                  connectOption === opt
                    ? 'bg-[#630ed4] text-white border-[#630ed4]'
                    : 'border-[#630ed4] text-[#630ed4] hover:bg-purple-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <FieldError message={errors.connectOption} />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={sending}
          className="w-full bg-[#630ed4] text-white font-semibold text-[15px] py-3 rounded-[12px] hover:bg-[#500088] transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send collaboration request'}
        </button>
      </div>
    </div>
  );
}
