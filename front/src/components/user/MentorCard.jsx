import { useNavigate } from 'react-router';
import { FiCalendar } from 'react-icons/fi';
import { getCurrentLogin } from '../../utils/storage';

export default function MentorCard({ mentor, onRequest }) {
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();
  const isOwnProfile = currentUser?.id === mentor.id;

  const promotedDate = mentor.created_at
    ? new Date(mentor.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full max-w-[320px] mx-auto">
      <div className="h-[200px] w-full overflow-hidden bg-[#d9d9d9]">
        {mentor.avatar_url ? (
          <img
            src={mentor.avatar_url}
            alt={mentor.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400">
            <span className="text-3xl font-bold text-purple-600/60">
              {mentor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-[#151c27] text-[18px] font-semibold leading-tight">
          {mentor.full_name}
        </h3>

        <div className="flex items-center gap-2 text-[#4c4452] text-[14px]">
          <FiCalendar size={14} className="shrink-0" />
          <span>Promoted: {promotedDate}</span>
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          {isOwnProfile ? (
            <span className="bg-gray-100 text-gray-500 py-2 rounded-lg font-semibold text-sm tracking-wide w-full text-center cursor-default">
              This is you
            </span>
          ) : (
            <button
              onClick={() => onRequest && onRequest(mentor)}
              className="bg-[#500088] text-white py-2 rounded-lg font-semibold text-sm tracking-wide w-full hover:bg-[#3d006a] transition-colors"
            >
              Request for Mentor
            </button>
          )}
          <button
            onClick={() => navigate(`/profile/${mentor.id}`)}
            className="border border-[#500088] text-[#500088] py-2 rounded-lg font-semibold text-sm tracking-wide w-full hover:bg-purple-50 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
