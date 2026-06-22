import { useState } from 'react';
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
import {
  mockProjects,
  mockUsers,
  mockHearts,
  mockFavorites,
  mockComments,
  getUserById,
} from '../../data/mockdata';
import { getCurrentLogin } from '../../utils/storage';
// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Main Component ────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = mockProjects.find((p) => p.id === Number(id));

  const currentUser = getCurrentLogin();
  const [hearted, setHearted] = useState(
    currentUser ? mockHearts.some((h) => h.user_id === currentUser.id && h.project_id === Number(id)) : false
  );
  const [bookmarked, setBookmarked] = useState(
    currentUser ? mockFavorites.some((f) => f.user_id === currentUser.id && f.project_id === Number(id)) : false
  );
  const [localHearts, setLocalHearts] = useState(
    mockHearts.filter((h) => h.project_id === Number(id)).length
  );
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(
    mockComments.filter((c) => c.project_id === Number(id))
  );

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

  const author = getUserById(project.author_id);
  const tags = JSON.parse(project.tags || '[]');
  const links = JSON.parse(project.external_links || '[]');
  const aboutText = project.description;

  function handleDeleteComment(commentId) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  function handleHeart() {
    setHearted(!hearted);
    setLocalHearts((prev) => (hearted ? prev - 1 : prev + 1));
  }

  function handleBookmark() {
    setBookmarked(!bookmarked);
  }

  function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const fakeComment = {
      id: Date.now(),
      project_id: project.id,
      user_id: 2,
      parent_id: null,
      content: newComment.trim(),
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, fakeComment]);
    setNewComment('');
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-[Inter,sans-serif]">
      {/* Hero cover image */}
      <div className="relative w-full h-[420px] bg-[#d9d9d9] overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[48px] font-bold text-black/30">Project Cover</span>
        </div>
      </div>

      {/* Main content — two columns */}
      <div className="max-w-[1400px] mx-auto px-8 py-8 flex gap-6">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* About the Project card */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8">
            <h2 className="text-[36px] font-semibold text-black mb-4">About the Project</h2>
            <div className="text-[20px] text-black leading-relaxed whitespace-pre-line">
              {aboutText}
            </div>

            {/* External links */}
            {links.length > 0 && (
              <div className="flex gap-3 mt-5 flex-wrap">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#630ed4] font-medium text-sm border border-[#630ed4] px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {link.label.toLowerCase().includes('github') ? (
                      <FiGithub size={14} />
                    ) : (
                      <FiExternalLink size={14} />
                    )}
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Author info */}
            <div
              onClick={() => navigate(`/profile/${author?.id}`)}
              className="flex items-center gap-3 mt-6 pt-5 border-t border-[#e5e5e5] cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors -mx-2 px-2"
            >
              <div className="w-10 h-10 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                {author?.avatar_url && (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-base text-black hover:text-[#630ed4] transition-colors">{author?.full_name}</p>
                <p className="text-sm text-[#919191] capitalize">{author?.role}</p>
              </div>
              <span className="ml-auto text-sm text-[#919191]">
                Published {formatDate(project.created_at)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={project.file_path}
                download={project.file_original_name}
                className="flex items-center gap-2 bg-[#630ed4] text-white font-semibold text-[18px] px-6 py-3 rounded-[10px] hover:bg-[#500088] transition-colors"
              >
                <FiDownload size={18} />
                Download ZIP
              </a>

              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 border border-[#65646f] bg-[#eee] text-[#630ed4] font-semibold text-[18px] px-6 py-3 rounded-[10px] hover:bg-[#e0e0e0] transition-colors"
              >
                <FiBookmark size={18} className={bookmarked ? 'fill-[#630ed4]' : ''} />
                {bookmarked ? 'Saved' : 'Favorite'}
              </button>

              <Link
                to="/request-collaboration"
                className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[18px] px-6 py-3 rounded-[10px] hover:bg-[#006919] transition-colors"
              >
                <FiUsers size={18} />
                Request Collaboration
              </Link>

              {author?.role === 'mentor' && (
                <button
                  onClick={() => navigate('/request-mentorship', { state: { mentor: author } })}
                  className="flex items-center gap-2 bg-[#1600c0] text-white font-semibold text-[18px] px-6 py-3 rounded-[10px] hover:bg-[#1200a0] transition-colors"
                >
                  <FiUser size={18} />
                  Request Mentor
                </button>
              )}
            </div>
          </div>

          {/* Reactions + Report */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-8 py-5 flex items-center gap-6">
            <p className="text-[#565656] font-medium text-[18px] uppercase tracking-wide">
              Reactions
            </p>
            <button
              onClick={handleHeart}
              className="flex items-center gap-2 text-[#565656] hover:text-red-500 transition-colors"
            >
              <FiHeart size={28} className={hearted ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-[16px] font-medium">{localHearts}</span>
            </button>
            <div className="ml-auto">
              <Link
                to="/report-project"
                className="flex items-center gap-1.5 text-[#565656] font-medium text-[18px] hover:text-red-500 transition-colors"
              >
                <FiFlag size={18} />
                Report Project
              </Link>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-8 py-6">
            <h3 className="text-[24px] font-semibold text-black mb-5">
              Comments ({comments.length})
            </h3>

            {/* Existing comments */}
            <div className="flex flex-col gap-4 mb-6">
              {comments.length === 0 && (
                <p className="text-gray-400 text-base">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => {
                const commenter = getUserById(comment.user_id);
                const isOwn = currentUser?.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d9d9d9] overflow-hidden shrink-0">
                      {commenter?.avatar_url && (
                        <img
                          src={commenter.avatar_url}
                          alt={commenter.full_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 bg-[#f6f5f5] rounded-[10px] px-4 py-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          onClick={() => navigate(`/profile/${commenter?.id}`)}
                          className="font-semibold text-sm text-black hover:text-[#630ed4] cursor-pointer transition-colors"
                        >
                          {commenter?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-[#919191]">
                          {formatDate(comment.created_at)}
                          {comment.is_edited && ' (edited)'}
                        </span>
                        {isOwn && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-auto text-[#919191] hover:text-red-500 transition-colors"
                            title="Delete comment"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-base text-black leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* New comment input */}
            <form onSubmit={submitComment} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d9d9d9] shrink-0" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border border-[#bdbdbd] rounded-[10px] px-4 py-2.5 text-base outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#630ed4] text-white px-4 py-2.5 rounded-[10px] hover:bg-[#500088] transition-colors"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────── */}
        <div className="w-[420px] shrink-0 flex flex-col gap-5">
          {/* Project Status card */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-7 py-5">
            <p className="text-[#565656] font-medium text-[18px] uppercase tracking-wide mb-4">
              Project Status
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[20px] font-light text-black">
                  <FiEye size={20} /> Views
                </span>
                <span className="text-[20px] text-black font-normal">{project.view_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[20px] font-light text-black">
                  <FiMessageSquare size={20} /> Comments
                </span>
                <span className="text-[20px] text-black font-normal">{comments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[20px] font-light text-black">
                  <FiHeart size={20} /> Hearts
                </span>
                <span className="text-[20px] text-black font-normal">{localHearts}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[16px] text-[#919191]">File size</span>
                <span className="text-[16px] text-black">{formatFileSize(project.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[16px] text-[#919191]">Last updated</span>
                <span className="text-[16px] text-black">{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Tech Stack card */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-7 py-5">
            <p className="text-[#565656] font-medium text-[18px] uppercase tracking-wide mb-4">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#630ed4]/20 text-black text-[12px] font-normal px-3 py-1 rounded-[20px]"
                >
                  {tag}
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-gray-400 text-sm">No tags listed</span>
              )}
            </div>
          </div>

          {/* Want to collaborate card */}
          <div className="bg-[#8a38f5] rounded-[15px] px-7 py-7">
            <h3 className="text-[24px] font-semibold text-white mb-3">
              Want to collaboration?
            </h3>
            <p className="text-[18px] font-medium text-white opacity-90 leading-relaxed mb-5">
              {author?.full_name} is looking for contributors. Reach out and let's build together!
            </p>
            <Link
              to="/request-collaboration"
              className="flex items-center gap-2 bg-white text-[#630ed4] font-medium text-[22px] px-5 py-2.5 rounded-[10px] hover:bg-purple-50 transition-colors w-full justify-center"
            >
              <FiSend size={18} />
              Send message
            </Link>
          </div>

          {/* File info card */}
          <div className="bg-white border border-[#bdbdbd] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-7 py-5">
            <p className="text-[#565656] font-medium text-[18px] uppercase tracking-wide mb-3">
              Downloads
            </p>
            <div className="flex flex-col gap-1 text-sm text-[#919191] mb-4">
              <span>
                File: <span className="text-black font-medium">{project.file_original_name}</span>
              </span>
              <span>
                Size: <span className="text-black">{formatFileSize(project.file_size)}</span>
              </span>
            </div>
            <a
              href={project.file_path}
              download={project.file_original_name}
              className="flex items-center justify-center gap-2 bg-[#630ed4] text-white font-semibold text-[16px] py-3 rounded-[10px] hover:bg-[#500088] transition-colors w-full"
            >
              <FiDownload size={18} />
              Download Project
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}