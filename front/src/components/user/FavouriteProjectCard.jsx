import { useNavigate } from 'react-router';
import { FiHeart, FiMessageSquare, FiEye, FiBookmark } from 'react-icons/fi';
import { getProjectCover } from '../../utils/projectCover';

export default function FavouriteProjectCard({ project, onRemove }) {
  const navigate = useNavigate();

  const viewCount =
    project.view_count >= 1000
      ? `${(project.view_count / 1000).toFixed(1)}k`
      : project.view_count;

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-full"
    >
      <div className="bg-[#d9d9d9] h-[150px] w-full relative overflow-hidden">
        <img
          src={getProjectCover(project)}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(project.id); }}
            title="Remove from favorites"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-lg p-1 transition-colors shadow-sm"
          >
            <FiBookmark size={16} className="fill-[#630ed4] text-[#630ed4]" />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-[16px] font-normal text-black leading-normal mb-1 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-[#919191] text-[13px] font-medium mb-2">
          {project.full_name || 'Unknown'} · {project.author_role || 'User'}
        </p>
        <p className="text-black text-[14px] leading-normal line-clamp-2 mb-2">
          {project.description}
        </p>

        <div className="border-t border-[#d9d9d9] pt-2 flex items-center gap-4 justify-around">
          <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
            <FiHeart size={15} /> {project.heart_count ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
            <FiMessageSquare size={15} /> {project.comment_count ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
            <FiEye size={15} /> {viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
