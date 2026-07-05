import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  FiArrowLeft, FiHeart, FiMessageSquare, FiEye, FiDownload,
  FiBookmark, FiFlag, FiSend, FiTrash2, FiEdit3, FiImage,
  FiArchive, FiExternalLink, FiGithub, FiSave, FiX
} from 'react-icons/fi';
import { getProjectById, updateProject, deleteProject, uploadProjectThumbnail, uploadProjectFile, downloadProjectFile } from '../../api/projectApi';
import { addFavorite, removeFavorite } from '../../api/favoriteApi';
import { getProjectComments, createComment, deleteComment } from '../../api/commentApi';
import { getReportsOnMyProjects } from '../../api/reportApi';
import { getCurrentLogin } from '../../utils/storage';
import { getProjectCover } from '../../utils/projectCover';

function formatFileSize(bytes) {
  if (!bytes) return 'N/A';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1000).toFixed(0)} KB`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function UploadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editLinks, setEditLinks] = useState([]);
  const [newCover, setNewCover] = useState(null);
  const [newZip, setNewZip] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await getProjectById(id);
        const proj = data.data;
        if (proj.author_id !== currentUser?.id) {
          navigate(`/project/${id}`, { replace: true });
          return;
        }
        setProject(proj);
        setBookmarked(proj.isFavorited || false);

        const [commentsRes, reportsRes] = await Promise.allSettled([
          getProjectComments(id, { page: 1, limit: 50 }),
          getReportsOnMyProjects({ page: 1, limit: 999 }),
        ]);
        if (commentsRes.status === 'fulfilled') {
          setComments(commentsRes.value.data.data || []);
        }
        if (reportsRes.status === 'fulfilled') {
          const allReports = reportsRes.value.data.data || [];
          setReportCount(allReports.filter((r) => r.project_id === Number(id) || r.project_title === proj.title).length);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, currentUser, navigate]);

  const CATEGORIES = ['Web Development', 'AI & Machine Learning', 'Mobile Development', 'DevOps', 'UI/UX Design', 'Data Science', 'IoT', 'Other'];

  function openEditModal() {
    setEditTitle(project.title || '');
    setEditDescription(project.description || '');
    setEditCategory(project.category || '');
    setEditTags((() => {
      if (Array.isArray(project.tags)) return project.tags.join(', ');
      try { return JSON.parse(project.tags || '[]').join(', '); } catch { return project.tags || ''; }
    })());
    setEditLinks((() => {
      if (Array.isArray(project.external_links)) return project.external_links;
      try { return JSON.parse(project.external_links || '[]'); } catch { return []; }
    })());
    setNewCover(null);
    setNewZip(null);
    setShowEditModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const tagsArray = editTags.split(',').map((t) => t.trim()).filter(Boolean);
      await updateProject(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory || null,
        tags: tagsArray,
        external_links: editLinks,
      });
      if (newCover) {
        await uploadProjectThumbnail(id, newCover);
        setProject((prev) => ({ ...prev, thumbnail: URL.createObjectURL(newCover) }));
      }
      if (newZip) {
        await uploadProjectFile(id, newZip);
        setProject((prev) => ({ ...prev, file_original_name: newZip.name, file_size: newZip.size }));
      }
      setProject((prev) => ({
        ...prev,
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory || null,
        tags: JSON.stringify(editTags.split(',').map((t) => t.trim()).filter(Boolean)),
        external_links: JSON.stringify(editLinks),
      }));
      setShowEditModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(id);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete.';
      alert(msg);
      setDeleting(false);
    }
  }

  async function handleBookmark() {
    try {
      if (bookmarked) {
        await removeFavorite(id);
        setBookmarked(false);
      } else {
        await addFavorite(id);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const { data } = await createComment({
        project_id: Number(id),
        content: newComment.trim(),
      });
      setComments((prev) => [data.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSendingComment(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  }

  function addLink() {
    setEditLinks((prev) => [...prev, { label: '', url: '' }]);
  }

  function updateLink(index, field, value) {
    setEditLinks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeLink(index) {
    setEditLinks((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tags = (() => {
    if (Array.isArray(project.tags)) return project.tags;
    try { return JSON.parse(project.tags || '[]'); } catch { return []; }
  })();
  const links = (() => {
    if (Array.isArray(project.external_links)) return project.external_links;
    try { return JSON.parse(project.external_links || '[]'); } catch { return []; }
  })();

  return (
    <div className="font-[Inter,sans-serif]">
      {/* ── Cover Image + Hero Title ── */}
      <div className="relative w-full h-[350px] bg-[#d9d9d9] overflow-hidden">
        <img
          src={getProjectCover(project)}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#630ed4] font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <FiArrowLeft size={15} />
          Dashboard
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-white text-[32px] font-bold leading-tight">{project.title}</h1>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-[#630ed4] font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <FiEdit3 size={14} />
            Update
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-red-500 font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6">

        {/* ── Two Column Layout ── */}
        <div className="flex gap-5">
          {/* Left: Project Info */}
          <div className="flex-1 flex flex-col gap-4">
            {/* About */}
            <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] p-6">
              <h2 className="text-[20px] font-semibold text-black mb-3">About the Project</h2>
              <div className="text-[15px] text-black leading-relaxed whitespace-pre-line">
                {project.description}
              </div>

              {links.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#630ed4] font-medium text-xs border border-[#630ed4] px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      {link.label?.toLowerCase().includes('github') ? (
                        <FiGithub size={12} />
                      ) : (
                        <FiExternalLink size={12} />
                      )}
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              <div
                onClick={() => navigate(`/profile/${project.author_id}`)}
                className="flex items-center gap-3 mt-5 pt-4 border-t border-[#e5e5e5] cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors -mx-2 px-2"
              >
                <div className="w-9 h-9 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                  {project.avatar_url ? (
                    <img src={project.avatar_url} alt={project.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                      {project.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-black hover:text-[#630ed4] transition-colors">{project.full_name}</p>
                  <p className="text-xs text-[#919191] capitalize">{project.author_role || 'student'}</p>
                </div>
                <span className="ml-auto text-xs text-[#919191]">
                  Published {formatDate(project.created_at)}
                </span>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
              <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-3">Tech Stack</p>
              {project.category && (
                <div className="mb-2.5 pb-2.5 border-b border-[#e5e5e5]">
                  <span className="text-[11px] text-[#919191] uppercase tracking-wide font-medium">Category</span>
                  <p className="text-[13px] text-black font-medium mt-0.5">{project.category}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="bg-[#630ed4]/20 text-black text-[11px] font-normal px-2.5 py-0.5 rounded-[16px]">{tag}</span>
                ))}
                {tags.length === 0 && <span className="text-gray-400 text-xs">No tags listed</span>}
              </div>
            </div>

            {/* Downloads Info */}
            <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
              <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-2.5">Downloads</p>
              <div className="flex flex-col gap-1 text-xs text-[#919191] mb-3">
                <span>File: <span className="text-black font-medium">{project.file_original_name || 'No file uploaded'}</span></span>
                <span>Size: <span className="text-black">{formatFileSize(project.file_size)}</span></span>
              </div>
              <button
                onClick={() => downloadProjectFile(project.id, project.file_original_name)}
                className="flex items-center justify-center gap-2 bg-[#630ed4] text-white font-semibold text-[14px] py-2.5 rounded-[8px] hover:bg-[#500088] transition-colors w-full"
              >
                <FiDownload size={15} />
                Download Project
              </button>
            </div>
          </div>

          {/* Right: Comments + Stats */}
          <div className="w-[380px] shrink-0 flex flex-col gap-4">
            {/* Comments */}
            <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-5">
              <h3 className="text-[18px] font-semibold text-black mb-4">
                Comments ({comments.length})
              </h3>

              <div className="flex flex-col gap-3 mb-5 max-h-[400px] overflow-y-auto">
                {comments.length === 0 && (
                  <p className="text-gray-400 text-sm">No comments yet.</p>
                )}
                {comments.map((comment) => {
                  const isOwn = currentUser?.id === comment.user_id;
                  return (
                    <div key={comment.id} className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                        {comment.avatar_url ? (
                          <img src={comment.avatar_url} alt={comment.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {comment.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 bg-[#f6f5f5] rounded-[8px] px-3 py-2.5">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-xs text-black">
                            {comment.full_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-[#919191]">
                            {formatDate(comment.created_at)}
                          </span>
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="ml-auto text-[#919191] hover:text-red-500 transition-colors"
                              title="Delete comment"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-black leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submitComment} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d9d9d9] shrink-0" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-[#bdbdbd] rounded-[8px] px-3 py-2 text-sm outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="bg-[#630ed4] text-white px-3 py-2 rounded-[8px] hover:bg-[#500088] transition-colors disabled:opacity-50"
                  >
                    <FiSend size={15} />
                  </button>
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
              <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-3">Project Stats</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiEye size={16} /> Views</span>
                  <span className="font-medium text-black text-[14px]">{project.view_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiHeart size={16} /> Hearts</span>
                  <span className="font-medium text-black text-[14px]">{project.heart_count || 0}</span>
                </div>
                <button onClick={handleBookmark} className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg -mx-2 px-2 py-1 transition-colors">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiBookmark size={16} /> Bookmark</span>
                  <span className={`font-medium text-[14px] ${bookmarked ? 'text-[#630ed4]' : 'text-black'}`}>
                    {bookmarked ? 'Saved' : 'Save'}
                  </span>
                </button>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiDownload size={16} /> Downloads</span>
                  <span className="font-medium text-black text-[14px]">{project.file_original_name ? '1' : '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiMessageSquare size={16} /> Comments</span>
                  <span className="font-medium text-black text-[14px]">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-[#565656]"><FiFlag size={16} /> Reports</span>
                  <span className="font-medium text-black text-[14px]">{reportCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Fullscreen Overlay ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#191c1d]">Update Project</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <FiX size={20} />
              </button>
            </div>

            <div className="px-6 py-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-xl h-[80px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
                  <FiImage size={20} className="text-gray-400 group-hover:text-[#630ed4] mb-0.5 transition-colors" />
                  <p className="text-[11px] font-semibold text-black">{newCover ? newCover.name : 'New Cover'}</p>
                  <input type="file" accept="image/png,image/jpg,image/jpeg" className="hidden" onChange={(e) => setNewCover(e.target.files?.[0] || null)} />
                </label>
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-xl h-[80px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
                  <FiArchive size={20} className="text-gray-400 group-hover:text-[#630ed4] mb-0.5 transition-colors" />
                  <p className="text-[11px] font-semibold text-black">{newZip ? newZip.name : 'New ZIP'}</p>
                  <input type="file" accept=".zip,.tar.gz" className="hidden" onChange={(e) => setNewZip(e.target.files?.[0] || null)} />
                </label>
              </div>

              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Project Title" className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#630ed4] transition-colors" />
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] outline-none appearance-none bg-white focus:border-[#630ed4] transition-colors cursor-pointer">
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags: Python, TensorFlow, CAD..." className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#630ed4] transition-colors" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" rows={3} className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] outline-none resize-none focus:border-[#630ed4] transition-colors" />

              <div className="flex flex-col gap-1.5">
                {editLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label" className="flex-1 border border-[#65646f] rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-[#630ed4] transition-colors" />
                    <input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="URL" className="flex-[2] border border-[#65646f] rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-[#630ed4] transition-colors" />
                    <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 size={13} /></button>
                  </div>
                ))}
                <button onClick={addLink} className="text-[#630ed4] text-xs font-semibold hover:underline self-start">+ Add Link</button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#630ed4] text-white rounded-lg text-sm font-semibold hover:bg-[#500088] transition-colors disabled:opacity-50">
                <FiSave size={14} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-[#191c1d] mb-2">Delete Project</h3>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}