import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FiInfo, FiSend, FiCheck } from 'react-icons/fi';
import { respondToMentorship, getMentorshipRequestById } from '../../api/mentorshipApi';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1.5">{message}</p>;
}

function FormTextarea({ label, value, onChange, placeholder, rows = 4, error, optional = false }) {
  return (
    <div>
      <label className="text-[#4a4455] font-medium text-[11px] block mb-1.5">
        {label}{optional && ' (optional)'}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#f8f9fa] border border-[#ccc3d8] rounded-[6px] px-3 py-2.5 text-[14px] text-[rgba(123,116,135,0.8)] placeholder:text-[rgba(123,116,135,0.5)] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
      />
      <FieldError message={error} />
    </div>
  );
}

export default function RespondMentorship() {
  const navigate = useNavigate();
  const location = useLocation();
  const mentorshipId = location.state?.id;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [overallTake, setOverallTake] = useState('');
  const [thingsToConsider, setThingsToConsider] = useState('');
  const [suggestedApproach, setSuggestedApproach] = useState('');
  const [resources, setResources] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!mentorshipId) {
      setLoading(false);
      return;
    }
    getMentorshipRequestById(mentorshipId)
      .then(({ data }) => setRequest(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mentorshipId]);

  function validate() {
    const newErrors = {};
    if (!overallTake.trim()) newErrors.overallTake = 'Please share your overall take on this project.';
    if (!thingsToConsider.trim()) newErrors.thingsToConsider = 'Please share what they should consider before building.';
    if (!suggestedApproach.trim()) newErrors.suggestedApproach = 'Please suggest an approach.';
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSending(true);
    try {
      await respondToMentorship(mentorshipId, {
        status: 'accepted',
        mentor_response: {
          overall_take: overallTake,
          things_to_consider: thingsToConsider,
          suggested_approach: suggestedApproach,
          resources: resources,
        },
      });
      setIsSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send response. Please try again.';
      setErrors({ overallTake: msg });
    } finally {
      setSending(false);
    }
  }

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const projectContext = request?.project_context || '';
  const contextLines = projectContext.split('\n').reduce((acc, line) => {
    const [key, ...rest] = line.split(': ');
    acc[key.trim().toLowerCase()] = rest.join(': ').trim();
    return acc;
  }, {});
  const requestTitle = contextLines['title'] || 'Project';
  const requestAbout = contextLines['about'] || projectContext;
  const requestStage = contextLines['stage'] || '';
  const requestHelp = request?.help_needed || '';

  // Show success state
  if (isSubmitted) {
    return (
      <div className="py-8 px-6 font-[Inter,sans-serif] h-[80vh] items-center flex">
        <div className="max-w-[500px] mx-auto ">
          <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[12px] shadow-sm p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                <FiCheck size={32} className="text-[#630ed4]" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="font-bold text-[22px] text-[#191c1d] tracking-tight leading-tight mb-1.5">
              Guidance Sent Successfully!
            </h2>
            <p className="text-[#4a4455] text-[15px] leading-relaxed mb-6">
              Your mentorship response has been sent to the student. They'll be notified immediately.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/inbox')}
                className="px-6 py-2.5 bg-[#630ed4] text-white font-semibold rounded-[10px] hover:bg-[#500088] transition-colors text-sm"
              >
                Back to Inbox
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-white text-[#630ed4] font-semibold rounded-[10px] border border-[#630ed4] hover:bg-gray-50 transition-colors text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !mentorshipId) {
    return (
      <div className="py-8 px-6 font-[Inter,sans-serif]">
        <div className="max-w-[1000px] mx-auto text-center py-16">
          <p className="text-[#4a4455]">No mentorship request selected.</p>
          <button onClick={() => navigate('/inbox')} className="mt-4 text-[#630ed4] font-semibold hover:underline">
            Go to Inbox
          </button>
        </div>
      </div>
    );
  }

  const studentName = request?.student_name || 'Student';
  const studentInitials = getInitials(studentName);

  return (
    <div className="py-8 px-6 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="max-w-[1000px] mx-auto mb-6">
        <h1 className="font-bold text-[24px] text-[#191c1d] tracking-tight leading-tight">
          Respond to Mentorship Request
        </h1>
        <p className="text-[#4a4455] text-[15px] mt-0.5">
          Share your expertise — your written guidance could shape their entire project.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 gap-5">
        {/* Left: Original request */}
        <div className="flex flex-col gap-3 self-start">
          <div>
            <p className="text-[#191c1d] font-semibold text-[11px] uppercase tracking-[0.7px] mb-2.5">
              Mentorship Request From
            </p>

            {/* Student info */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-10 h-10 rounded-full bg-[#2170e4] flex items-center justify-center shrink-0 overflow-hidden">
                {request?.student_avatar ? (
                  <img src={request.student_avatar} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-[13px]">{studentInitials}</span>
                )}
              </div>
              <div>
                <p className="text-[#191c1d] font-semibold text-[15px] leading-tight">{studentName}</p>
                <span className="bg-[#d8e2ff] text-[#001a42] font-bold text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full">
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* Request details card */}
          <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-4">
            {/* Project */}
            <div>
              <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wide mb-0.5">Project</p>
              <p className="text-[#191c1d] font-semibold text-[14px] leading-snug">{requestTitle}</p>
            </div>

            {/* About */}
            <div>
              <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wide mb-0.5">About</p>
              <p className="text-[#4a4455] text-[14px] leading-relaxed">{requestAbout}</p>
            </div>

            {/* Stage + Looking for */}
            <div className="flex gap-5">
              {requestStage && (
                <div>
                  <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wide mb-1">Stage</p>
                  <span className="bg-[#4edea3] text-[#005236] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                    {requestStage}
                  </span>
                </div>
              )}
            </div>

            {/* Needs guidance on */}
            <div>
              <p className="text-[#7b7487] font-medium text-[11px] uppercase tracking-wide mb-0.5">Needs guidance on</p>
              <p className="text-[#4a4455] text-[14px] italic leading-relaxed">
                &quot;{requestHelp}&quot;
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="flex items-center gap-2 px-1">
            <FiInfo size={14} className="text-[#7b7487] shrink-0" />
            <p className="text-[#4a4455] text-[13px]">
              Read through their request carefully before writing your response.
            </p>
          </div>
        </div>

        {/* Right: Response form */}
        <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[12px] shadow-sm p-6 flex flex-col gap-5 self-start">
          <FormTextarea
            label="Your overall take on this project"
            value={overallTake}
            onChange={(e) => {
              setOverallTake(e.target.value);
              setErrors((prev) => ({ ...prev, overallTake: '' }));
            }}
            placeholder="Initial impressions and potential..."
            rows={3}
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
            rows={4}
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
            rows={4}
            error={errors.suggestedApproach}
          />

          <FormTextarea
            label="Resources or references"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            placeholder="Links to papers, tools, or similar projects..."
            rows={2}
            optional
          />

          {/* Submit */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending}
              className="w-full bg-[#7c3aed] text-white font-normal text-[15px] py-3 rounded-[10px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend size={15} />
              {sending ? 'Sending...' : 'Send Guidance'}
            </button>
            <p className="text-[#7b7487] text-[11px] text-center mt-2 leading-relaxed">
              Your response will be saved and visible to the student in their request history. This is
              document-based guidance only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
