import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiHeart, FiMessageSquare, FiEye, FiBookmark } from 'react-icons/fi';
import { addFavorite, removeFavorite } from '../../api/favoriteApi';
import { toggleHeart as toggleHeartApi } from '../../api/projectApi';
import { getProjectCover } from '../../utils/projectCover';

export default function ProjectCard({ project, author, heartCount, commentCount, isHearted = false, isFavorited = false, isOwner = false }) {
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(isFavorited);
  const [liked, setLiked] = useState(isHearted);
  const [localHearts, setLocalHearts] = useState(heartCount || 0);
  const [togglingHeart, setTogglingHeart] = useState(false);
  const [togglingBookmark, setTogglingBookmark] = useState(false);

  useEffect(() => { setLiked(isHearted); }, [isHearted]);
  useEffect(() => { setBookmarked(isFavorited); }, [isFavorited]);

  async function handleLike(e) {
    e.stopPropagation();
    if (togglingHeart) return;
    setTogglingHeart(true);
    try {
      const { data } = await toggleHeartApi(project.id);
      const isNowHearted = data.data?.isHearted;
      setLiked(isNowHearted);
      setLocalHearts((prev) => prev + (isNowHearted ? 1 : -1));
    } catch (err) {
      console.error('Failed to toggle heart:', err);
    } finally {
      setTogglingHeart(false);
    }
  }

  async function handleBookmark(e) {
    e.stopPropagation();
    if (togglingBookmark) return;
    setTogglingBookmark(true);
    try {
      if (bookmarked) {
        await removeFavorite(project.id);
        setBookmarked(false);
      } else {
        await addFavorite(project.id);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setTogglingBookmark(false);
    }
  }

  return (
    <div
      onClick={() => navigate(isOwner ? `/upload-detail/${project.id}` : `/project/${project.id}`)}
      className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="bg-[#d9d9d9] h-[150px] w-full relative overflow-hidden">
        <img
          src={getProjectCover(project)}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <button
          onClick={handleBookmark}
          className="absolute top-2 right-2 hover:scale-110 transition-transform"
        >
          <FiBookmark
            size={18}
            className={bookmarked ? 'fill-[#630ed4] text-[#630ed4]' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-[16px] font-normal text-black leading-normal mb-1 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-[#919191] text-[13px] font-medium mb-2">
          {author?.full_name} · {author?.role === 'student' ? 'Student' : author?.role}
        </p>
        <p className="text-black text-[14px] leading-normal line-clamp-2 mb-2">
          {project.description}
        </p>

        {/* Divider */}
        <div className="border-t border-[#d9d9d9] pt-2 flex items-center justify-around">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-[#919191] text-[13px] font-medium hover:text-red-500 transition-colors"
          >
            <FiHeart size={15} className={liked ? 'fill-red-500 text-red-500' : ''} />
            {localHearts}
          </button>
          <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
            <FiMessageSquare size={15} />
            {commentCount || 0}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
            <FiEye size={15} />
            {project.view_count >= 1000
              ? `${(project.view_count / 1000).toFixed(1)}k`
              : project.view_count}
          </span>
        </div>
      </div>
    </div>
  );
}
