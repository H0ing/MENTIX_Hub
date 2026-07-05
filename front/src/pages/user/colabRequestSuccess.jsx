import { useNavigate, useLocation } from 'react-router';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { MdOutlineHandshake } from 'react-icons/md';

export default function ColabRequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const projectName = state.projectName || 'your project';
  const interestedProject = state.interestedProject || '';
  const skills = state.skills || [];
  const connectOption = state.connectOption || '';

  return (
    <div className="flex flex-col items-center py-12 font-[Inter,sans-serif]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#008321] opacity-10 blur-[16px] rounded-full" />
        <div className="relative bg-white border-4 border-[rgba(0,131,33,0.2)] rounded-full px-5 py-4">
          <div className="w-[48px] h-[48px] flex items-center justify-center">
            <FiCheck size={32} className="text-[#008321]" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[520px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[12px] shadow-sm p-8 flex flex-col items-center gap-3">
        <h1 className="font-bold text-[24px] text-[#191c1d] tracking-tight text-center leading-tight">
          Collaboration Request Sent
        </h1>

        <p className="text-[#4a4455] text-[15px] text-center leading-relaxed max-w-[400px]">
          Your collaboration request for{' '}
          <span className="text-[#630ed4] font-bold">&apos;{projectName}&apos;</span>{' '}
          has been sent successfully.
        </p>

        <div className="w-full bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[10px] p-5 flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgba(0,131,33,0.1)] rounded-[6px] flex items-center justify-center shrink-0">
              <MdOutlineHandshake size={24} className="text-[#008321]" />
            </div>
            <div>
              <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-0.5">
                Your Project
              </p>
              <p className="text-[#191c1d] font-semibold text-[15px]">{projectName}</p>
            </div>
          </div>

          {interestedProject && (
            <div className="border-t border-[rgba(204,195,216,0.3)] pt-2.5">
              <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-0.5">
                Interested In
              </p>
              <p className="text-[#191c1d] text-[14px]">{interestedProject}</p>
            </div>
          )}

          <div className="border-t border-[rgba(204,195,216,0.3)] pt-2.5 flex gap-5">
            {skills.length > 0 && (
              <div>
                <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-1.5">
                  Skills Offered
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[rgba(0,131,33,0.1)] text-[#005b3d] font-semibold text-[11px] px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {connectOption && (
              <div>
                <p className="text-[#4a4455] font-medium text-[10px] uppercase tracking-wider mb-1.5">
                  Connect Via
                </p>
                <span className="bg-[rgba(33,112,228,0.1)] text-[#0058be] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                  {connectOption}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[13px] px-6 py-3 rounded-[10px] hover:bg-[#006919] transition-colors shadow-[0px_8px_12px_-3px_rgba(0,131,33,0.2)]"
          >
            Return to Dashboard
            <FiArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate(`/collab-request/${state.requestId}`)}
            className="flex items-center gap-2 bg-[rgba(0,131,33,0.1)] text-[#008321] font-semibold text-[13px] px-6 py-3 rounded-[10px] border border-[rgba(0,131,33,0.2)] hover:bg-[rgba(0,131,33,0.05)] transition-colors"
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
}
