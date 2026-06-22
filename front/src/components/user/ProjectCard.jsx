import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiHeart, FiMessageSquare, FiEye, FiBookmark } from 'react-icons/fi';
import { mockHearts, mockFavorites } from '../../data/mockdata';
import { getCurrentLogin } from '../../utils/storage';

export default function ProjectCard({ project, author, heartCount, commentCount }) {
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();

  const [bookmarked, setBookmarked] = useState(
    currentUser ? mockFavorites.some((f) => f.user_id === currentUser.id && f.project_id === project.id) : false
  );
  const [liked, setLiked] = useState(
    currentUser ? mockHearts.some((h) => h.user_id === currentUser.id && h.project_id === project.id) : false
  );
  const [localHearts, setLocalHearts] = useState(heartCount || 0);

  function handleLike(e) {
    e.stopPropagation();
    setLiked(!liked);
    setLocalHearts(liked ? localHearts - 1 : localHearts + 1);
  }

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="bg-[#d9d9d9] h-[189px] w-full relative">
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
          className="absolute top-3 right-3 hover:scale-110 transition-transform"
        >
          <FiBookmark
            size={26}
            className={bookmarked ? 'fill-[#630ed4] text-[#630ed4]' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[24px] font-normal text-black leading-normal mb-1 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-[#919191] text-[16px] font-medium mb-3">
          {author?.full_name} · {author?.role === 'student' ? 'Student' : author?.role}
        </p>
        <p className="text-black text-[18px] leading-normal line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Divider */}
        <div className="border-t border-[#d9d9d9] pt-3 flex items-center justify-around">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-[#919191] text-[16px] font-medium hover:text-red-500 transition-colors"
          >
            <FiHeart size={20} className={liked ? 'fill-red-500 text-red-500' : ''} />
            {localHearts}
          </button>
          <span className="flex items-center gap-1 text-[#919191] text-[16px] font-medium">
            <FiMessageSquare size={20} />
            {commentCount || 0}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[16px] font-medium">
            <FiEye size={20} />
            {project.view_count >= 1000
              ? `${(project.view_count / 1000).toFixed(1)}k`
              : project.view_count}
          </span>
        </div>
      </div>
    </div>
  );
}
