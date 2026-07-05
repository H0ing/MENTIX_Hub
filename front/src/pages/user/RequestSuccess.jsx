import { useNavigate, useLocation } from 'react-router';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { MdOutlineSchool } from 'react-icons/md';

export default function RequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const mentorName = state.mentor?.full_name || 'your mentor';
  const projectTitle = state.projectTitle || 'your project';
  const guidanceType = state.guidanceType || '';
  const helpNeeded = state.helpNeeded || '';

  return (
    <div className="flex flex-col items-center py-12 font-[Inter,sans-serif] h-[80vh]">
      {/* Success icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#630ed4] opacity-10 blur-[16px] rounded-full" />
        <div className="relative bg-white border-4 border-[rgba(124,58,237,0.2)] rounded-full px-5 py-4">
          <div className="w-[48px] h-[48px] flex items-center justify-center">
            <FiCheck size={32} className="text-[#630ed4]" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Central card */}
      <div className="w-full max-w-[520px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[12px] shadow-sm p-8 flex flex-col items-center gap-3">
        <h1 className="font-bold text-[24px] text-[#191c1d] tracking-tight text-center leading-tight">
          Request Sent Successfully
        </h1>

        <p className="text-[#4a4455] text-[15px] text-center leading-relaxed max-w-[400px]">
          Your project{' '}
          <span className="text-[#630ed4] font-bold">&apos;{projectTitle}&apos;</span>{' '}
          has been shared with <strong>{mentorName}</strong>.
        </p>

        {/* Summary card */}
        <div className="w-full bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[10px] p-5 flex items-center gap-6 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgba(124,58,237,0.1)] rounded-[6px] flex items-center justify-center shrink-0">
              <MdOutlineSchool size={24} className="text-[#630ed4]" />
            </div>
            <div>
              <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-0.5">
                Project Title
              </p>
              <p className="text-[#191c1d] font-semibold text-[15px]">{projectTitle}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-[rgba(204,195,216,0.5)] shrink-0" />

          <div>
            <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-1.5">
              Guidance Type
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {guidanceType && (
                <span className="bg-[rgba(0,118,80,0.1)] text-[#005b3d] font-semibold text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {guidanceType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#630ed4] text-white font-semibold text-[13px] px-6 py-3 rounded-[10px] hover:bg-[#500088] transition-colors shadow-[0px_8px_12px_-3px_rgba(99,14,212,0.2)]"
          >
            Return to Dashboard
            <FiArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate(`/mentor-request/${state.requestId}`)}
            className="flex items-center gap-2 bg-[rgba(33,112,228,0.1)] text-[#630ed4] font-semibold text-[13px] px-6 py-3 rounded-[10px] border border-[rgba(99,14,212,0.2)] hover:bg-[rgba(99,14,212,0.05)] transition-colors"
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
}
