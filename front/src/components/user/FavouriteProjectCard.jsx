import { useNavigate } from 'react-router';
import { FiHeart, FiMessageSquare, FiEye, FiBookmark } from 'react-icons/fi';
import { mockHearts, mockComments, getUserById } from '../../data/mockdata';

export default function FavouriteProjectCard({ project, onRemove }) {
  const navigate = useNavigate();
  const author = getUserById(project.author_id);
  const heartCount = mockHearts.filter((h) => h.project_id === project.id).length;
  const commentCount = mockComments.filter((c) => c.project_id === project.id).length;
  const viewCount =
    project.view_count >= 1000
      ? `${(project.view_count / 1000).toFixed(1)}k`
      : project.view_count;

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="bg-[#d9d9d9] h-[189px] w-full relative">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(project.id); }}
            title="Remove from favorites"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-lg p-1.5 transition-colors shadow-sm"
          >
            <FiBookmark size={20} className="fill-[#630ed4] text-[#630ed4]" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[24px] font-normal text-black leading-normal mb-1 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-[#919191] text-[16px] font-medium mb-3">
          {author?.full_name || 'Unknown'} · {author?.role || 'User'}
        </p>
        <p className="text-black text-[18px] leading-normal line-clamp-2 mb-3">
          {project.description}
        </p>

        <div className="border-t border-[#d9d9d9] pt-3 flex items-center gap-6">
          <span className="flex items-center gap-1 text-[#919191] text-[16px] font-medium">
            <FiHeart size={20} /> {heartCount}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[16px] font-medium">
            <FiMessageSquare size={20} /> {commentCount}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[16px] font-medium">
            <FiEye size={20} /> {viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
