import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { submitReport } from '../../api/reportApi';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function ReportProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;

  const [problem, setProblem] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Critical');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function validate() {
    const newErrors = {};
    if (!problem.trim()) newErrors.problem = 'Please describe the problem of this project.';
    if (!reason.trim()) newErrors.reason = 'Please tell us your reason for reporting.';
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!projectId) {
      setErrors({ problem: 'No project selected for reporting.' });
      return;
    }

    setSending(true);
    try {
      await submitReport({
        project_id: projectId,
        reason,
        description: problem,
        priority: priority.toLowerCase(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report. Please try again.';
      setErrors({ problem: msg });
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-12 font-[Inter,sans-serif] h-[80vh]">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 max-w-sm text-center">
          <div className="text-4xl mb-3">✓</div>
          <h2 className="text-xl font-bold text-[#191c1d] mb-1.5">Report Submitted</h2>
          <p className="text-[#4a4455] text-sm">
            Thank you for reporting. Our moderation team will review the project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-[Inter,sans-serif]">
      <div className="max-w-[640px] mx-auto bg-white rounded-[20px] shadow-sm border border-gray-100 px-8 py-8">
        <h1 className="font-bold text-[28px] text-black text-center mb-6 leading-tight">
          Report this project
        </h1>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[#001a42] font-semibold text-[13px] block mb-1.5">
              Please Describe the problem of this project.
            </label>
            <textarea
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                setErrors((prev) => ({ ...prev, problem: '' }));
              }}
              placeholder="I see this project is the scam because the zip file attacked the malware."
              rows={4}
              className="w-full bg-[#f6f5f5] border border-[#c1c1c1] rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.problem} />
          </div>

          <div>
            <label className="text-[#001a42] font-semibold text-[13px] block mb-1.5">
              Tell me your reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="why u report this project"
              rows={3}
              className="w-full bg-[#f6f5f5] border border-[#c1c1c1] rounded-[12px] px-3 py-2.5 text-[#65646f] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.reason} />
          </div>

          <div>
            <label className="text-[#001a42] font-semibold text-[13px] block mb-2">Priority</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-5 py-1.5 rounded-full font-semibold text-[13px] border transition-colors ${
                    priority === p
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                      : 'bg-white text-[#4a4455] border-[#ccc3d8] hover:border-[#7c3aed]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="w-full bg-[#630ed4] text-white font-semibold text-[15px] py-3 rounded-[12px] hover:bg-[#500088] transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </div>
    </div>
  );
}
