import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiBookmark,
  FiX,
} from 'react-icons/fi';
import { mockHearts, mockComments, mockFavorites, getUserById } from '../../data/mockdata';
import { getCurrentLogin } from '../../utils/storage';

function EditProjectModal({ project, onClose, onSave }) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [tags, setTags] = useState(() => {
    try {
      return JSON.parse(project.tags).join(', ');
    } catch {
      return '';
    }
  });

  function handleSave() {
    onSave({
      ...project,
      title,
      description,
      tags: JSON.stringify(
        tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      ),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[560px] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#191c1d]">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#ccc3d8] rounded-xl px-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
          </div>
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-[#ccc3d8] rounded-xl px-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
          </div>
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, python, machine-learning"
              className="w-full border border-[#ccc3d8] rounded-xl px-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-[#ccc3d8] text-[#4a4455] font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-[#630ed4] text-white font-semibold py-3 rounded-xl hover:bg-[#500088] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadProjectCard({ project, onDelete, showFavorite = false }) {
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);
  const [favorited, setFavorited] = useState(
    showFavorite && currentUser
      ? mockFavorites.some((f) => f.user_id === currentUser.id && f.project_id === project.id)
      : false
  );
  const menuRef = useRef(null);

  const author = getUserById(currentProject.author_id);
  const heartCount = mockHearts.filter((h) => h.project_id === currentProject.id).length;
  const commentCount = mockComments.filter((c) => c.project_id === currentProject.id).length;
  const viewCount =
    currentProject.view_count >= 1000
      ? `${(currentProject.view_count / 1000).toFixed(1)}k`
      : currentProject.view_count;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSave(updated) {
    setCurrentProject(updated);
  }

  return (
    <>
      <div
        onClick={() => navigate(`/project/${currentProject.id}`)}
        className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="bg-[#d9d9d9] h-[189px] w-full relative">
          {currentProject.thumbnail && (
            <img
              src={currentProject.thumbnail}
              alt={currentProject.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          {showFavorite ? (
            <button
              onClick={(e) => { e.stopPropagation(); setFavorited(!favorited); }}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-lg p-1.5 transition-colors shadow-sm"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiBookmark size={18} className={favorited ? 'fill-[#630ed4] text-[#630ed4]' : 'text-gray-600'} />
            </button>
          ) : (
            <div className="absolute top-3 right-3" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="bg-white/80 hover:bg-white rounded-lg p-1.5 transition-colors text-gray-600 shadow-sm"
              >
                <FiMoreVertical size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 bg-white border border-[#d9d9d9] rounded-xl shadow-lg z-20 w-36 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#4a4455] hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (onDelete) onDelete(currentProject.id);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[24px] font-normal text-black leading-normal mb-1 line-clamp-2">
            {currentProject.title}
          </h3>
          <p className="text-[#919191] text-[16px] font-medium mb-3">
            {author?.full_name || 'Unknown'} · {author?.role || 'User'}
          </p>
          <p className="text-black text-[18px] leading-normal line-clamp-2 mb-3">
            {currentProject.description}
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

      {editOpen && (
        <EditProjectModal
          project={currentProject}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
