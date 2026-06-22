import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiInfo, FiSend, FiCheck } from 'react-icons/fi';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1.5">{message}</p>;
}

function FormTextarea({ label, value, onChange, placeholder, rows = 4, error, optional = false }) {
  return (
    <div>
      <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
        {label}{optional && ' (optional)'}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#f8f9fa] border border-[#ccc3d8] rounded-[8px] px-4 py-3 text-[16px] text-[rgba(123,116,135,0.8)] placeholder:text-[rgba(123,116,135,0.5)] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
      />
      <FieldError message={error} />
    </div>
  );
}

export default function RespondMentorship() {
  const navigate = useNavigate();

  const [overallTake, setOverallTake] = useState('');
  const [thingsToConsider, setThingsToConsider] = useState('');
  const [suggestedApproach, setSuggestedApproach] = useState('');
  const [resources, setResources] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate() {
    const newErrors = {};
    if (!overallTake.trim()) newErrors.overallTake = 'Please share your overall take on this project.';
    if (!thingsToConsider.trim()) newErrors.thingsToConsider = 'Please share what they should consider before building.';
    if (!suggestedApproach.trim()) newErrors.suggestedApproach = 'Please suggest an approach.';
    return newErrors;
  }

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitted(true);
  }

  // Show success state
  if (isSubmitted) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                <FiCheck size={40} className="text-[#630ed4]" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="font-bold text-[28px] text-[#191c1d] tracking-tight leading-tight mb-2">
              Guidance Sent Successfully!
            </h2>
            <p className="text-[#4a4455] text-[18px] leading-relaxed mb-8">
              Your mentorship response has been sent to the student. They'll be notified immediately.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setOverallTake('');
                  setThingsToConsider('');
                  setSuggestedApproach('');
                  setResources('');
                }}
                className="px-8 py-3 bg-[#630ed4] text-white font-semibold rounded-[12px] hover:bg-[#500088] transition-colors"
              >
                Send Another Response
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white text-[#630ed4] font-semibold rounded-[12px] border border-[#630ed4] hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <h1 className="font-bold text-[36px] text-[#191c1d] tracking-tight leading-tight">
          Respond to Mentorship Request
        </h1>
        <p className="text-[#4a4455] text-[18px] mt-1">
          Share your expertise — your written guidance could shape their entire project.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-6">
        {/* Left: Original request */}
        <div className="flex flex-col gap-4 self-start">
          <div>
            <p className="text-[#191c1d] font-semibold text-[13px] uppercase tracking-[0.7px] mb-3">
              Mentorship Request From
            </p>

            {/* Student info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#2170e4] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[16px]">SC</span>
              </div>
              <div>
                <p className="text-[#191c1d] font-semibold text-[18px] leading-tight">Sarah Chen</p>
                <span className="bg-[#d8e2ff] text-[#001a42] font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full">
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* Request details card */}
          <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-5">
            {/* Project */}
            <div>
              <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1">Project</p>
              <p className="text-[#191c1d] font-semibold text-[16px] leading-snug">
                Autonomous Neural Networks for Urban Logistics
              </p>
            </div>

            {/* About */}
            <div>
              <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1">About</p>
              <p className="text-[#4a4455] text-[16px] leading-relaxed">
                An investigation into self-correcting routing algorithms specifically designed for
                dense urban environments with high unpredictability.
              </p>
            </div>

            {/* Stage + Looking for */}
            <div className="flex gap-6">
              <div>
                <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1.5">Stage</p>
                <span className="bg-[#4edea3] text-[#005236] font-semibold text-[12px] px-3 py-1 rounded-full">
                  In development
                </span>
              </div>
              <div>
                <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1.5">Looking for</p>
                <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[12px] px-3 py-1 rounded-full">
                  Technical Validation
                </span>
              </div>
            </div>

            {/* Needs guidance on */}
            <div>
              <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1">Needs guidance on</p>
              <p className="text-[#4a4455] text-[16px] italic leading-relaxed">
                &quot;I need to validate the ethical constraints and edge-case handling for autonomous
                decision making in emergency scenarios.&quot;
              </p>
            </div>

            {/* Already tried */}
            <div>
              <p className="text-[#7b7487] font-medium text-[12px] uppercase tracking-wide mb-1">Already tried</p>
              <p className="text-[#4a4455] text-[16px] leading-relaxed">
                &quot;I've run simulations on the base reinforcement model, but it struggles with
                prioritizing non-standard obstacles.&quot;
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="flex items-center gap-2 px-1">
            <FiInfo size={16} className="text-[#7b7487] shrink-0" />
            <p className="text-[#4a4455] text-[16px]">
              Read through their request carefully before writing your response.
            </p>
          </div>
        </div>

        {/* Right: Response form */}
        <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-8 flex flex-col gap-6 self-start">
          <FormTextarea
            label="Your overall take on this project"
            value={overallTake}
            onChange={(e) => {
              setOverallTake(e.target.value);
              setErrors((prev) => ({ ...prev, overallTake: '' }));
            }}
            placeholder="Initial impressions and potential..."
            rows={4}
            error={errors.overallTake}
          />

          <FormTextarea
            label="What they should consider before building"
            value={thingsToConsider}
            onChange={(e) => {
              setThingsToConsider(e.target.value);
              setErrors((prev) => ({ ...prev, thingsToConsider: '' }));
            }}
            placeholder="List key risks, ethical dilemmas, or edge cases..."
            rows={5}
            error={errors.thingsToConsider}
          />

          <FormTextarea
            label="Suggested approach — how to build this correctly"
            value={suggestedApproach}
            onChange={(e) => {
              setSuggestedApproach(e.target.value);
              setErrors((prev) => ({ ...prev, suggestedApproach: '' }));
            }}
            placeholder="Recommended tech stack, frameworks, or methodologies..."
            rows={5}
            error={errors.suggestedApproach}
          />

          <FormTextarea
            label="Resources or references"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            placeholder="Links to papers, tools, or similar projects..."
            rows={3}
            optional
          />

          {/* Submit */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#7c3aed] text-white font-normal text-[18px] py-4 rounded-[12px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2"
            >
              <FiSend size={18} />
              Send Guidance
            </button>
            <p className="text-[#7b7487] text-[12px] text-center mt-3 leading-relaxed">
              Your response will be saved and visible to the student in their request history. This is
              document-based guidance only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}