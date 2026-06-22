import { useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function ReportProject() {
  const [problem, setProblem] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Critical');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const newErrors = {};
    if (!problem.trim()) newErrors.problem = 'Please describe the problem of this project.';
    if (!reason.trim()) newErrors.reason = 'Please tell us your reason for reporting.';
    return newErrors;
  }

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen flex items-center justify-center font-[Inter,sans-serif]">
        <div className="bg-white rounded-[23px] border border-gray-100 shadow-sm p-12 max-w-md text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-[#191c1d] mb-2">Report Submitted</h2>
          <p className="text-[#4a4455] text-base">
            Thank you for reporting. Our moderation team will review the project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 font-[Inter,sans-serif]">
      {/* Card */}
      <div className="max-w-[740px] mx-auto bg-white rounded-[23px] shadow-sm border border-gray-100 px-12 py-10">
        <h1 className="font-bold text-[42px] text-black text-center mb-8 leading-tight">
          Report this project
        </h1>

        <div className="flex flex-col gap-6">
          {/* Problem description */}
          <div>
            <label className="text-[#001a42] font-semibold text-[15px] block mb-2">
              Please Describe the problem of this project.
            </label>
            <textarea
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                setErrors((prev) => ({ ...prev, problem: '' }));
              }}
              placeholder="I see this project is the scam because the zip file attacked the malware."
              rows={5}
              className="w-full bg-[#f6f5f5] border border-[#c1c1c1] rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.problem} />
          </div>

          {/* Reason */}
          <div>
            <label className="text-[#001a42] font-semibold text-[15px] block mb-2">
              Tell me your reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="why u report this project"
              rows={4}
              className="w-full bg-[#f6f5f5] border border-[#c1c1c1] rounded-[15px] px-4 py-3 text-[#65646f] text-[17px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.reason} />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[#001a42] font-semibold text-[15px] block mb-3">Priority</label>
            <div className="flex gap-3 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-6 py-2 rounded-full font-semibold text-[15px] border transition-colors ${
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

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#630ed4] text-white font-semibold text-[18px] py-4 rounded-[14px] hover:bg-[#500088] transition-colors mt-2"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
}