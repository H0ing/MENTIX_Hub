import { useState } from 'react';
import { useNavigate } from 'react-router';

const SKILL_OPTIONS = ['UI design', 'Frontend dev', 'Data analysis', 'UX research'];
const CONNECT_OPTIONS = ['Discord', 'Email', 'Line', 'Facebook', 'Either'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function RequestCollaboration() {
  const navigate = useNavigate();

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

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const requestData = {
      id: Date.now(),
      intro: form.intro,
      project_interested: form.projectInterested,
      own_project_name: form.ownProjectName,
      own_project_desc: form.ownProjectDesc,
      why_collaborate: form.whyCollaborate,
      skills: selectedSkills,
      other_skill: form.otherSkill,
      preferred_connect: connectOption,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('request-collaboration', JSON.stringify(requestData));
    navigate('/colab-request-success');
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 font-[Inter,sans-serif]">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-[48px] text-black leading-tight">Request Collaboration</h1>
        <p className="text-[#433f3f] text-2xl mt-2">
          &quot;I saw your project, I have a similar vibe — let's work together.&quot;
        </p>
      </div>

      {/* Card */}
      <div className="max-w-[740px] mx-auto bg-white rounded-[23px] shadow-sm border border-gray-100 p-8 flex flex-col gap-5">
        {/* Intro */}
        <div>
          <textarea
            value={form.intro}
            onChange={(e) => update('intro', e.target.value)}
            placeholder="Introduce yourself and your project."
            rows={3}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
          />
          <FieldError message={errors.intro} />
        </div>

        {/* Project interested in */}
        <div>
          <label className="text-[#001a42] font-semibold text-[15px] block mb-1.5">
            Project you're interested in
          </label>
          <input
            type="text"
            value={form.projectInterested}
            onChange={(e) => update('projectInterested', e.target.value)}
            placeholder="Smart campus navigation"
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
          />
          <FieldError message={errors.projectInterested} />
        </div>

        {/* About your own project */}
        <div>
          <p className="text-[#001a42] font-semibold text-[15px] mb-3">About your own project</p>
          <label className="text-[#001a42] font-semibold text-[14px] block mb-1.5">
            Name of your project
          </label>
          <input
            type="text"
            value={form.ownProjectName}
            onChange={(e) => update('ownProjectName', e.target.value)}
            placeholder="e.g., AI powered Study Buddy"
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all mb-2"
          />
          <FieldError message={errors.ownProjectName} />
          <textarea
            value={form.ownProjectDesc}
            onChange={(e) => update('ownProjectDesc', e.target.value)}
            placeholder="Brief description of what you are working on"
            rows={4}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all mt-2"
          />
          <FieldError message={errors.ownProjectDesc} />
        </div>

        {/* Why collaborate */}
        <div>
          <label className="text-[#001a42] font-semibold text-[15px] block mb-1.5">
            Why you want to collaborate?
          </label>
          <textarea
            value={form.whyCollaborate}
            onChange={(e) => update('whyCollaborate', e.target.value)}
            placeholder="We can combine ...."
            rows={4}
            className="w-full bg-[#f6f5f5] border border-black/10 rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
          />
          <FieldError message={errors.whyCollaborate} />
        </div>

        {/* Skills chips */}
        <div>
          <label className="text-[#001a42] font-semibold text-[15px] block mb-2">
            What you bring to the table
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
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
            className="w-full border border-black/10 rounded-[15px] px-4 py-2.5 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
          />
        </div>

        {/* Preferred way to connect */}
        <div>
          <label className="text-[#001a42] font-semibold text-[15px] block mb-2">
            Preferred way to connect
          </label>
          <div className="flex flex-wrap gap-2">
            {CONNECT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setConnectOption(opt);
                  setErrors((prev) => ({ ...prev, connectOption: '' }));
                }}
                className={`px-5 py-2 rounded-[15px] border text-[17px] font-semibold transition-colors ${
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
          className="w-full bg-[#630ed4] text-white font-semibold text-[18px] py-4 rounded-[14px] hover:bg-[#500088] transition-colors mt-2"
        >
          Send collaboration request
        </button>
      </div>
    </div>
  );
}