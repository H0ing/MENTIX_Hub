import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FiMapPin } from 'react-icons/fi';
import { getCurrentLogin } from '../../utils/storage';

const STAGE_OPTIONS = ['Just an idea', 'Planning', 'In development', 'Almost done'];
const GUIDANCE_OPTIONS = ['General direction', 'Technical feedback', 'Idea validation', 'All of the above'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1.5">{message}</p>;
}

function SelectableChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[14px] font-semibold border transition-colors ${
        active
          ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
          : 'bg-white text-[#4a4455] border-[#ccc3d8] hover:border-[#630ed4]'
      }`}
    >
      {label}
    </button>
  );
}

export default function RequestMentorship() {
  const navigate = useNavigate();
  const location = useLocation();
  const mentor = location.state?.mentor || getCurrentLogin();
  const currentUser = getCurrentLogin();

  const [form, setForm] = useState({
    projectTitle: '',
    projectAbout: '',
    guidanceNeed: '',
    previousEfforts: '',
  });
  const [projectStage, setProjectStage] = useState('');
  const [guidanceType, setGuidanceType] = useState('');
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.projectTitle.trim()) newErrors.projectTitle = 'Please enter your project title.';
    if (!form.projectAbout.trim()) newErrors.projectAbout = 'Please describe your project.';
    if (!projectStage) newErrors.projectStage = 'Please select the stage of your project.';
    if (!form.guidanceNeed.trim()) newErrors.guidanceNeed = 'Please describe what you need guidance on.';
    if (!form.previousEfforts.trim()) newErrors.previousEfforts = 'Please describe what you have already tried.';
    if (!guidanceType) newErrors.guidanceType = 'Please select the type of guidance you need.';
    return newErrors;
  }

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const requestData = {
      id: Date.now(),
      student_id: currentUser?.id || 2,
      mentor_id: mentor?.id,
      project_context: form.projectAbout,
      help_needed: form.guidanceNeed,
      previous_efforts: form.previousEfforts,
      project_stage: projectStage,
      guidance_type: guidanceType,
      project_title: form.projectTitle,
      status: 'pending',
      mentor_response: null,
      responded_at: null,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('request-mentor', JSON.stringify({ mentor, request: requestData }));
    navigate('/request-success');
  }

  const initials = mentor?.full_name
    ? mentor.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      <div className="max-w-[1200px] mx-auto mb-8">
        <h1 className="font-bold text-[36px] text-[#191c1d] tracking-tight leading-tight">
          Request Mentorship
        </h1>
        <p className="text-[#4a4455] text-[18px] mt-1">
          I'm building something and I'd love your direction.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-5 gap-6">
        {/* Left: Mentor context */}
        <div className="col-span-2 flex flex-col gap-4 self-start">
          <p className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-[0.7px]">
            Mentor Context
          </p>

          <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden">
              {mentor?.avatar_url ? (
                <img src={mentor.avatar_url} alt={mentor.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-[18px]">{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#191c1d] font-semibold text-[18px]">{mentor?.full_name || 'Unknown Mentor'}</span>
                <span className="bg-[rgba(0,118,80,0.1)] text-[#005b3d] font-bold text-[10px] uppercase tracking-tight px-2 py-0.5 rounded-full">
                  Mentor
                </span>
              </div>
              <p className="text-[#4a4455] text-[16px]">{mentor?.bio || 'Expert Mentor'}</p>
            </div>
          </div>

          <p className="text-[#4a4455] text-[16px] leading-relaxed px-1">
            You're reaching out to <strong>{mentor?.full_name || 'your mentor'}</strong> for guidance on your project.
          </p>

          <div className="bg-white border border-[#ccc3d8] rounded-[16px] p-6">
            <p className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider mb-3">
              Why Mentorship Works Here
            </p>
            <p className="text-[#4a4455] text-[16px] leading-relaxed">
              Mentors on MENTIX-Hub share written guidance based on their experience. You'll
              receive documented feedback — practical direction you can apply directly to your project.
            </p>
          </div>

          <div className="flex gap-3 px-1">
            <FiMapPin size={18} className="text-[#0058be] shrink-0 mt-0.5" />
            <p className="text-[#0058be] text-[15px] italic leading-relaxed">
              Be specific about where you're stuck. Mentors can give better guidance when they
              understand exactly what stage your project is at and what you've already tried.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="col-span-3 bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-8 flex flex-col gap-6">
          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={form.projectTitle}
              onChange={(e) => update('projectTitle', e.target.value)}
              placeholder="e.g. Smart Campus Navigation App"
              className="w-full bg-white border border-[#ccc3d8] rounded-[8px] px-4 py-3 text-[#4a4455] text-[16px] placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
            <FieldError message={errors.projectTitle} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-1.5">
              What is your project about?
            </label>
            <textarea
              value={form.projectAbout}
              onChange={(e) => update('projectAbout', e.target.value)}
              placeholder="Briefly describe what you're building..."
              rows={4}
              className="w-full bg-white border border-[#ccc3d8] rounded-[8px] px-4 py-3 text-[#4a4455] text-[16px] placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.projectAbout} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
              What stage is your project at?
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGE_OPTIONS.map((stage) => (
                <SelectableChip
                  key={stage}
                  label={stage}
                  active={projectStage === stage}
                  onClick={() => {
                    setProjectStage(stage);
                    setErrors((prev) => ({ ...prev, projectStage: '' }));
                  }}
                />
              ))}
            </div>
            <FieldError message={errors.projectStage} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-1.5">
              What do you specifically need guidance on?
            </label>
            <textarea
              value={form.guidanceNeed}
              onChange={(e) => update('guidanceNeed', e.target.value)}
              placeholder="e.g. I'm not sure how to structure my database schema..."
              rows={4}
              className="w-full bg-white border border-[#ccc3d8] rounded-[8px] px-4 py-3 text-[#4a4455] text-[16px] placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.guidanceNeed} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-1.5">
              What have you already tried or researched?
            </label>
            <textarea
              value={form.previousEfforts}
              onChange={(e) => update('previousEfforts', e.target.value)}
              placeholder="e.g. I watched tutorials on REST APIs..."
              rows={4}
              className="w-full bg-white border border-[#ccc3d8] rounded-[8px] px-4 py-3 text-[#4a4455] text-[16px] placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.previousEfforts} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
              What kind of guidance are you looking for?
            </label>
            <div className="flex flex-wrap gap-2">
              {GUIDANCE_OPTIONS.map((type) => (
                <SelectableChip
                  key={type}
                  label={type}
                  active={guidanceType === type}
                  onClick={() => {
                    setGuidanceType(type);
                    setErrors((prev) => ({ ...prev, guidanceType: '' }));
                  }}
                />
              ))}
            </div>
            <FieldError message={errors.guidanceType} />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#630ed4] text-white font-normal text-[18px] py-4 rounded-[12px] hover:bg-[#500088] transition-colors"
            >
              Send Mentorship Request
            </button>
            <p className="text-[#4a4455] text-[12px] text-center mt-3 leading-relaxed">
              The mentor will review your request and respond with written guidance. No sessions or
              calls — just documented advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
