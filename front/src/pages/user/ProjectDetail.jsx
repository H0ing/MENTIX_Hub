import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiDownload,
  FiBookmark,
  FiUsers,
  FiUser,
  FiFlag,
  FiSend,
  FiExternalLink,
  FiGithub,
  FiTrash2,
} from 'react-icons/fi';
import { getProjectById, toggleHeart, downloadProjectFile } from '../../api/projectApi';
import { addFavorite, removeFavorite } from '../../api/favoriteApi';
import { getProjectComments, createComment, deleteComment } from '../../api/commentApi';
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentLogin();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hearted, setHearted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [localHearts, setLocalHearts] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [projRes, commentsRes] = await Promise.all([
          getProjectById(id),
          getProjectComments(id, { page: 1, limit: 50 }),
        ]);
        const proj = projRes.data.data;
        setProject(proj);
        setHearted(proj.isHearted || false);
        setBookmarked(proj.isFavorited || false);
        setLocalHearts(proj.heart_count || 0);
        setComments(commentsRes.data.data || []);
        setCommentCount(proj.comment_count || 0);
      } catch (err) {
        console.error('Failed to load project:', err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleHeart() {
    if (!currentUser) return;
    try {
      const { data } = await toggleHeart(id);
      const isNowHearted = data.data.isHearted;
      setHearted(isNowHearted);
      setLocalHearts((prev) => (isNowHearted ? prev + 1 : prev - 1));
    } catch (err) {
      console.error('Failed to toggle heart:', err);
    }
  }

  async function handleBookmark() {
    if (!currentUser) return;
    try {
      if (bookmarked) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
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

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-[Inter,sans-serif]">
        <p className="text-2xl font-semibold text-gray-500">Project not found.</p>
        <button
          onClick={() => navigate('/')}
          className="text-[#630ed4] font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const author = {
    id: project.author_id,
    full_name: project.full_name,
    avatar_url: project.avatar_url,
    role: project.author_role || 'student',
  };
  const tags = (() => {
    if (Array.isArray(project.tags)) return project.tags;
    try { return JSON.parse(project.tags || '[]'); } catch { return []; }
  })();
  const links = (() => {
    if (Array.isArray(project.external_links)) return project.external_links;
    try { return JSON.parse(project.external_links || '[]'); } catch { return []; }
  })();

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-[Inter,sans-serif]">
      <div className="relative w-full h-[350px] bg-[#d9d9d9] overflow-hidden">
        <img
          src={getProjectCover(project)}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-white text-[32px] font-bold mb-2 leading-tight">{project.title}</h1>
          <div className="flex items-center gap-2.5">
            {project.avatar_url ? (
              <img src={project.avatar_url} alt={project.full_name} className="w-8 h-8 rounded-full object-cover border border-white/30" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#d9d9d9] flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white/30">
                {project.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </span>
            )}
            <span className="text-white/90 text-sm font-medium">{project.full_name}</span>
            <span className="text-white/50 text-xs">·</span>
            <span className="text-white/60 text-sm">{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6 flex gap-5">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] p-6">
            <h2 className="text-[24px] font-semibold text-black mb-3">About the Project</h2>
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
              onClick={() => navigate(`/profile/${author.id}`)}
              className="flex items-center gap-3 mt-5 pt-4 border-t border-[#e5e5e5] cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors -mx-2 px-2"
            >
              <div className="w-9 h-9 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {author.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-black hover:text-[#630ed4] transition-colors">
                  {author.full_name}
                </p>
                <p className="text-xs text-[#919191] capitalize">{author.role}</p>
              </div>
              <span className="ml-auto text-xs text-[#919191]">
                Published {formatDate(project.created_at)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={() => downloadProjectFile(project.id, project.file_original_name)}
                className="flex items-center gap-2 bg-[#630ed4] text-white font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#500088] transition-colors"
              >
                <FiDownload size={15} />
                Download ZIP
              </button>

              <button
                onClick={handleBookmark}
                disabled={!currentUser}
                className="flex items-center gap-2 border border-[#65646f] bg-[#eee] text-[#630ed4] font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
              >
                <FiBookmark size={15} className={bookmarked ? 'fill-[#630ed4]' : ''} />
                {bookmarked ? 'Saved' : 'Favorite'}
              </button>

              <Link
                to="/request-collaboration"
                state={{ receiver: author }}
                className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#006919] transition-colors"
              >
                <FiUsers size={15} />
                Request Collaboration
              </Link>

              {author.role === 'mentor' && (
                <button
                  onClick={() => navigate('/request-mentorship', { state: { mentor: author } })}
                  className="flex items-center gap-2 bg-[#1600c0] text-white font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#1200a0] transition-colors"
                >
                  <FiUser size={15} />
                  Request Mentor
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-6 py-3.5 flex items-center gap-4">
            <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide">
              Reactions
            </p>
            <button
              onClick={handleHeart}
              disabled={!currentUser}
              className="flex items-center gap-2 text-[#565656] hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <FiHeart size={22} className={hearted ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-[13px] font-medium">{localHearts}</span>
            </button>
            <div className="ml-auto">
              <Link
                to="/report-project"
                state={{ projectId: id }}
                className="flex items-center gap-1.5 text-[#565656] font-medium text-[14px] hover:text-red-500 transition-colors"
              >
                <FiFlag size={15} />
                Report Project
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-6 py-5">
            <h3 className="text-[18px] font-semibold text-black mb-4">
              Comments ({comments.length})
            </h3>

            <div className="flex flex-col gap-3 mb-5">
              {comments.length === 0 && (
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => {
                const isOwn = currentUser?.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                      {comment.avatar_url ? (
                        <img
                          src={comment.avatar_url}
                          alt={comment.full_name}
          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {comment.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-[#f6f5f5] rounded-[8px] px-3 py-2.5">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span
                          onClick={() => navigate(`/profile/${comment.user_id}`)}
                          className="font-semibold text-xs text-black hover:text-[#630ed4] cursor-pointer transition-colors"
                        >
                          {comment.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-[#919191]">
                          {formatDate(comment.created_at)}
                          {!!comment.is_edited && ' (edited)'}
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

            {currentUser ? (
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
            ) : (
              <p className="text-sm text-gray-400 text-center">
                <Link to="/login" className="text-[#630ed4] hover:underline">Log in</Link> to leave a comment.
              </p>
            )}
          </div>
        </div>

        <div className="w-[340px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
            <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-3">
              Project Status
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[15px] font-light text-black">
                  <FiEye size={16} /> Views
                </span>
                <span className="text-[15px] text-black font-normal">{project.view_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[15px] font-light text-black">
                  <FiMessageSquare size={16} /> Comments
                </span>
                <span className="text-[15px] text-black font-normal">{commentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[15px] font-light text-black">
                  <FiHeart size={16} /> Hearts
                </span>
                <span className="text-[15px] text-black font-normal">{localHearts}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-[#919191]">File size</span>
                <span className="text-[13px] text-black">{formatFileSize(project.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#919191]">Last updated</span>
                <span className="text-[13px] text-black">{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
            <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-3">
              Tech Stack
            </p>
            {project.category && (
              <div className="mb-2.5 pb-2.5 border-b border-[#e5e5e5]">
                <span className="text-[11px] text-[#919191] uppercase tracking-wide font-medium">Category</span>
                <p className="text-[13px] text-black font-medium mt-0.5">{project.category}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#630ed4]/20 text-black text-[11px] font-normal px-2.5 py-0.5 rounded-[16px]"
                >
                  {tag}
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-gray-400 text-xs">No tags listed</span>
              )}
            </div>
          </div>

          <div className="bg-[#8a38f5] rounded-[12px] px-5 py-5">
            <h3 className="text-[18px] font-semibold text-white mb-2">
              Want to collaboration?
            </h3>
            <p className="text-[14px] font-medium text-white opacity-90 leading-relaxed mb-4">
              {author.full_name} is looking for contributors. Reach out and let's build together!
            </p>
            <Link
              to="/request-collaboration"
              state={{ receiver: author }}
              className="flex items-center gap-2 bg-white text-[#630ed4] font-medium text-[15px] px-4 py-2 rounded-[8px] hover:bg-purple-50 transition-colors w-full justify-center"
            >
              <FiSend size={15} />
              Send message
            </Link>
          </div>

          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_3px_3px_rgba(0,0,0,0.20)] px-5 py-4">
            <p className="text-[#565656] font-medium text-[14px] uppercase tracking-wide mb-2.5">
              Downloads
            </p>
            <div className="flex flex-col gap-1 text-xs text-[#919191] mb-3">
              <span>
                File: <span className="text-black font-medium">{project.file_original_name}</span>
              </span>
              <span>
                Size: <span className="text-black">{formatFileSize(project.file_size)}</span>
              </span>
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
      </div>
    </div>
  );
}
