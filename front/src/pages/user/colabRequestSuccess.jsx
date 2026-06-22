import { useNavigate } from 'react-router';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { MdOutlineHandshake } from 'react-icons/md';

export default function ColabRequestSuccess() {
  const navigate = useNavigate();

  let projectName = 'your project';
  let interestedProject = '';
  let skills = [];
  let connectOption = '';

  try {
    const saved = localStorage.getItem('request-collaboration');
    if (saved) {
      const parsed = JSON.parse(saved);
      interestedProject = parsed.project_interested || '';
      projectName = parsed.own_project_name || 'your project';
      skills = parsed.skills || [];
      connectOption = parsed.preferred_connect || '';
    }
  } catch {
    // fallback
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col items-center py-16 font-[Inter,sans-serif]">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#008321] opacity-10 blur-[20px] rounded-full" />
        <div className="relative bg-white border-4 border-[rgba(0,131,33,0.2)] rounded-full px-7 py-5">
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            <FiCheck size={40} className="text-[#008321]" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[640px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-12 flex flex-col items-center gap-4">
        <h1 className="font-bold text-[36px] text-[#191c1d] tracking-tight text-center leading-tight">
          Collaboration Request Sent
        </h1>

        <p className="text-[#4a4455] text-[18px] text-center leading-relaxed max-w-[480px]">
          Your collaboration request for{' '}
          <span className="text-[#630ed4] font-bold">&apos;{projectName}&apos;</span>{' '}
          has been sent successfully.
        </p>

        <div className="w-full bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[12px] p-6 flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[rgba(0,131,33,0.1)] rounded-[8px] flex items-center justify-center shrink-0">
              <MdOutlineHandshake size={32} className="text-[#008321]" />
            </div>
            <div>
              <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-1">
                Your Project
              </p>
              <p className="text-[#191c1d] font-semibold text-[18px]">{projectName}</p>
            </div>
          </div>

          {interestedProject && (
            <div className="border-t border-[rgba(204,195,216,0.3)] pt-3">
              <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-1">
                Interested In
              </p>
              <p className="text-[#191c1d] text-[16px]">{interestedProject}</p>
            </div>
          )}

          <div className="border-t border-[rgba(204,195,216,0.3)] pt-3 flex gap-6">
            {skills.length > 0 && (
              <div>
                <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-2">
                  Skills Offered
                </p>
                <div className="flex gap-2 flex-wrap">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[rgba(0,131,33,0.1)] text-[#005b3d] font-semibold text-[13px] px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {connectOption && (
              <div>
                <p className="text-[#4a4455] font-medium text-[11px] uppercase tracking-wider mb-2">
                  Connect Via
                </p>
                <span className="bg-[rgba(33,112,228,0.1)] text-[#0058be] font-semibold text-[13px] px-3 py-1 rounded-full">
                  {connectOption}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[14px] px-8 py-4 rounded-[12px] hover:bg-[#006919] transition-colors shadow-[0px_10px_15px_-3px_rgba(0,131,33,0.2)]"
          >
            Return to Dashboard
            <FiArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[rgba(0,131,33,0.1)] text-[#008321] font-semibold text-[14px] px-8 py-4 rounded-[12px] border border-[rgba(0,131,33,0.2)] hover:bg-[rgba(0,131,33,0.05)] transition-colors"
          >
            View My Requests
          </button>
        </div>
      </div>
    </div>
  );
}
