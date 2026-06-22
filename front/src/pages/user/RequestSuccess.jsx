import { useNavigate } from 'react-router';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';

export default function RequestSuccess() {
  const navigate = useNavigate();

  let mentorName = 'your mentor';
  let projectTitle = 'your project';
  let guidanceType = '';
  let helpNeeded = '';

  try {
    const saved = localStorage.getItem('request-mentor');
    if (saved) {
      const parsed = JSON.parse(saved);
      mentorName = parsed.mentor?.full_name || 'your mentor';
      projectTitle = parsed.request?.project_title || 'your project';
      guidanceType = parsed.request?.guidance_type || '';
      helpNeeded = parsed.request?.help_needed || '';
    }
  } catch {
    // fallback
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col items-center py-16 font-[Inter,sans-serif]">
      {/* Success icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#630ed4] opacity-10 blur-[20px] rounded-full" />
        <div className="relative bg-white border-4 border-[rgba(124,58,237,0.2)] rounded-full px-7 py-5">
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <FiCheck size={40} className="text-[#630ed4]" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Central card */}
      <div className="w-full max-w-[640px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-12 flex flex-col items-center gap-4">
        <h1 className="font-bold text-[36px] text-[#191c1d] tracking-tight text-center leading-tight">
          Request Sent Successfully
        </h1>

        <p className="text-[#4a4455] text-[18px] text-center leading-relaxed max-w-[480px]">
          Your project{' '}
          <span className="text-[#630ed4] font-bold">&apos;{projectTitle}&apos;</span>{' '}
          has been shared with <strong>{mentorName}</strong>.
        </p>

        {/* Summary card */}
        <div className="w-full bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[12px] p-6 flex items-center gap-10 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] rounded-[8px] flex items-center justify-center shrink-0">
              <MdOutlineSchool size={32} className="text-[#630ed4]" />
            </div>
            <div>
              <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-1">
                Project Title
              </p>
              <p className="text-[#191c1d] font-semibold text-[18px]">{projectTitle}</p>
            </div>
          </div>

          <div className="w-px h-12 bg-[rgba(204,195,216,0.5)] shrink-0" />

          <div>
            <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-2">
              Guidance Type
            </p>
            <div className="flex gap-2 flex-wrap">
              {guidanceType && (
                <span className="bg-[rgba(0,118,80,0.1)] text-[#005b3d] font-semibold text-[13px] px-3 py-1 rounded-full">
                  {guidanceType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#630ed4] text-white font-semibold text-[14px] px-8 py-4 rounded-[12px] hover:bg-[#500088] transition-colors shadow-[0px_10px_15px_-3px_rgba(99,14,212,0.2)]"
          >
            Return to Dashboard
            <FiArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[rgba(33,112,228,0.1)] text-[#630ed4] font-semibold text-[14px] px-8 py-4 rounded-[12px] border border-[rgba(99,14,212,0.2)] hover:bg-[rgba(99,14,212,0.05)] transition-colors"
          >
            View My Requests
          </button>
        </div>
      </div>
    </div>
  );
}
