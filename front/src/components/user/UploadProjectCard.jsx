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
import { updateProject } from '../../api/projectApi';
import { addFavorite, removeFavorite } from '../../api/favoriteApi';
import { getProjectCover } from '../../utils/projectCover';

function EditProjectModal({ project, onClose, onSave }) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [tags, setTags] = useState(() => {
    if (Array.isArray(project.tags)) return project.tags.join(', ');
    try {
      return JSON.parse(project.tags).join(', ');
    } catch {
      return '';
    }
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await updateProject(project.id, { title, description, tags: tagsArray });
      onSave({ ...project, title, description, tags: JSON.stringify(tagsArray) });
      onClose();
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-[480px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#191c1d]">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
          </div>
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
          </div>
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, python, machine-learning"
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
          </div>
          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-[#ccc3d8] text-[#4a4455] font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#630ed4] text-white font-semibold py-2.5 rounded-lg hover:bg-[#500088] transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadProjectCard({ project, onDelete, showFavorite = false }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);
  const [favorited, setFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const menuRef = useRef(null);

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
        onClick={() => navigate(`/upload-detail/${currentProject.id}`)}
        className="bg-white border border-[#d9d9d9] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:shadow-md transition-shadow cursor-pointer w-full relative"
      >
        <div className="bg-[#d9d9d9] h-[150px] w-full overflow-hidden rounded-t-xl ">
          <img
            src={getProjectCover(currentProject)}
            alt={currentProject.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div ref={menuRef}>
          {showFavorite ? (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (togglingFav) return;
                setTogglingFav(true);
                try {
                  if (favorited) {
                    await removeFavorite(currentProject.id);
                    setFavorited(false);
                  } else {
                    await addFavorite(currentProject.id);
                    setFavorited(true);
                  }
                } catch (err) {
                  console.error('Failed to toggle favorite:', err);
                } finally {
                  setTogglingFav(false);
                }
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-lg p-1 transition-colors shadow-sm"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiBookmark size={16} className={favorited ? 'fill-[#630ed4] text-[#630ed4]' : 'text-gray-600'} />
            </button>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-lg p-1 transition-colors text-gray-600 shadow-sm"
              >
                <FiMoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-2 top-10 bg-white border border-[#d9d9d9] rounded-xl shadow-lg z-20 w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#4a4455] hover:bg-gray-50 transition-colors rounded-t-xl"
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (onDelete) onDelete(currentProject.id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors rounded-b-xl"
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-[16px] font-normal text-black leading-normal mb-1 line-clamp-2">
            {currentProject.title}
          </h3>
          <p className="text-[#919191] text-[13px] font-medium mb-2">
            {currentProject.full_name || 'Unknown'} · {currentProject.author_role || 'User'}
          </p>
          <p className="text-black text-[14px] leading-normal line-clamp-2 mb-2">
            {currentProject.description}
          </p>

          <div className="border-t border-[#d9d9d9] pt-2 flex items-center gap-4 justify-around">
            <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
              <FiHeart size={15} /> {currentProject.heart_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
              <FiMessageSquare size={15} /> {currentProject.comment_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[#919191] text-[13px] font-medium">
              <FiEye size={15} /> {viewCount}
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
